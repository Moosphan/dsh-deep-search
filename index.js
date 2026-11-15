/**
 * Host half of dsh-deep-search.
 *
 * One lazily-built, incrementally refreshed in-memory index over every logical
 * Session (`ctx.sessionQuery`, live history preferred), one POST route for the
 * Web page. The index keeps the searchable projection only — semantic message
 * text, tool calls and tool output, extracted file paths, compacted summaries —
 * and drops streamed duplicates, reasoning (unless enabled), jobs and request
 * plumbing. A per-Session disk cache makes the next launch instant; revisions
 * come from the persistence snapshots, so only changed Sessions are re-read.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import zlib from 'node:zlib'

const ROUTE = '/deep-search/api'
const INDEX_VERSION = 6
const CALLER = 'deep-search'
const MAX_BODY_BYTES = 96 * 1024
/** Hard caps that keep one pathological log or one broad query finite. */
const MAX_DOC_CHARS = 8_000
const MAX_TOOL_CHARS = 5_000
const MAX_FILES_PER_DOC = 8
const MAX_PATH_CHARS = 260
const MAX_MATCHES_PER_DOC = 20
const MAX_HITS_PER_SESSION = 30
/** Candidate rows kept per Session before ranking; the display cap applies afterwards. */
const MAX_CANDIDATES_PER_SESSION = 400
const MAX_GROUPS = 48
const MAX_QUERY_CHARS = 400
const SEARCH_DEADLINE_MS = 3_200
/** Cache files. One JSON document per Session, gzip-compressed. */
const CACHE_VERSION = 1

const KIND = {
  message: 'm',
  file: 'f',
  tool: 't',
  output: 'o',
  reasoning: 'r',
  attachment: 'a',
  summary: 's',
}
const DEFAULT_KINDS = ['m', 'f', 't', 'o', 'a', 's']

const FILE_EXTENSIONS = new Set(
  (
    'md markdown mdx txt rst pdf doc docx rtf ppt pptx xls xlsx csv tsv ' +
    'ts tsx js jsx mjs cjs vue svelte astro py ipynb sh bash zsh fish ps1 bat cmd ' +
    'rs go java kt kts scala c h cc cpp cxx hpp cs swift m mm rb php lua dart ex exs erl hs clj ' +
    'html htm css scss sass less styl xml svg sql graphql gql yaml yml toml ini conf cfg env ' +
    'json jsonc json5 ndjson db sqlite sqlite3 parquet arrow ' +
    'png jpg jpeg webp gif bmp tif tiff heic avif ico ' +
    'mp4 mov mkv webm avi flv m4v mp3 wav flac m4a aac ogg opus zip tar gz zst 7z rar'
  ).split(/\s+/),
)

const EXT_KIND = new Map()
for (const ext of FILE_EXTENSIONS) {
  let kind = 'other'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'heic', 'avif', 'ico', 'svg'].includes(ext)) kind = 'image'
  else if (['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', 'm4v', 'mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus'].includes(ext)) kind = 'media'
  else if (['md', 'markdown', 'mdx', 'txt', 'rst', 'pdf', 'doc', 'docx', 'rtf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) kind = 'doc'
  else if (['json', 'jsonc', 'json5', 'ndjson', 'csv', 'tsv', 'xml', 'sql', 'db', 'sqlite', 'sqlite3', 'parquet', 'arrow'].includes(ext)) kind = 'data'
  else if (['yaml', 'yml', 'toml', 'ini', 'conf', 'cfg', 'env'].includes(ext)) kind = 'config'
  else kind = 'code'
  EXT_KIND.set(ext, kind)
}

export const inject = ['webServer', 'sessionQuery']

/**
 * Register the search route and warm the index.
 * @param ctx - Host plugin context (web server + session query).
 */
export function apply(ctx) {
  const index = createIndex(ctx)
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE,
        handler: (req, res) => handle(ctx, index, req, res),
      }),
    'deep-search: api route',
  )
  /* Warm in the background so the first open of the panel is not a cold start. */
  const timer = setTimeout(() => {
    index.ensure(false).catch((error) => warn('warm failed', error))
  }, 1_200)
  ctx.effect(() => () => clearTimeout(timer), 'deep-search: warm timer')
}

// #region HTTP -----------------------------------------------------------------

async function handle(ctx, index, req, res) {
  const rejection = gate(ctx, req)
  if (rejection !== undefined) {
    send(res, rejection, { ok: false, error: { code: 'forbidden', message: 'request rejected' } })
    return
  }
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    send(res, 405, { ok: false, error: { code: 'method', message: 'POST only' } })
    return
  }
  let payload
  try {
    payload = await readJson(req)
  } catch (error) {
    send(res, 400, { ok: false, error: { code: 'bad-request', message: messageOf(error) } })
    return
  }
  try {
    switch (payload.action) {
      case 'status':
        send(res, 200, { ok: true, value: index.status() })
        return
      case 'search':
        if (payload.stream === true) {
          await streamSearch(index, payload, res)
          return
        }
        send(res, 200, { ok: true, value: await index.search(payload) })
        return
      case 'detail':
        send(res, 200, { ok: true, value: await index.detail(payload) })
        return
      case 'reindex':
        index.reindex()
        send(res, 200, { ok: true, value: index.status() })
        return
      default:
        send(res, 400, { ok: false, error: { code: 'action', message: 'unknown action' } })
    }
  } catch (error) {
    warn('request failed', error)
    send(res, 500, { ok: false, error: { code: 'search', message: messageOf(error) } })
  }
}

function gate(ctx, req) {
  const connection = ctx.get('connection')
  if (connection !== undefined && typeof connection.requestRejection === 'function') {
    try {
      const rejection = connection.requestRejection({ headers: req.headers })
      if (rejection !== undefined && rejection !== null) return typeof rejection === 'number' ? rejection : 403
    } catch {
      return 403
    }
  }
  const address = req.socket?.remoteAddress ?? ''
  if (address !== '' && address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1') return 403
  return undefined
}

function send(res, status, body) {
  const text = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(text)
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  const value = JSON.parse(text === '' ? '{}' : text)
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('body must be an object')
  return value
}

/** Stream one search as NDJSON; newest/oldest walks sessions in recency order. */
async function streamSearch(index, payload, res) {
  if (res.writableEnded === true || res.destroyed === true) return
  res.statusCode = 200
  res.setHeader('content-type', 'application/x-ndjson; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  const emit = async (event) => {
    if (res.writableEnded === true || res.destroyed === true) return false
    res.write(`${JSON.stringify(event)}\n`)
    await new Promise((resolve) => setImmediate(resolve))
    return true
  }
  try {
    await index.stream(payload, emit)
    if (res.writableEnded !== true && res.destroyed !== true) res.end()
  } catch (error) {
    if (res.writableEnded !== true && res.destroyed !== true) {
      try {
        res.write(`${JSON.stringify({ type: 'error', message: messageOf(error) })}\n`)
      } catch {
        /* stream already gone */
      }
      res.end()
    }
  }
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

function warn(message, error) {
  try {
    console.warn(`[${CALLER}] ${message}`, error)
  } catch {
    /* no console */
  }
}

// #endregion

// #region Index ----------------------------------------------------------------

/** Cache is gzip so every supported Node version writes the same format. Reads still probe zstd for older caches. */
const HAS_ZSTD = typeof zlib.zstdDecompressSync === 'function'

function packCache(text) {
  return zlib.gzipSync(Buffer.from(text, 'utf8'))
}

function unpackCache(buffer) {
  try {
    return zlib.gunzipSync(buffer)
  } catch (error) {
    if (HAS_ZSTD) return zlib.zstdDecompressSync(buffer)
    throw error
  }
}

function createIndex(ctx) {
  /** id → { id, cwd, title, createdAt, updatedAt, rev, live, docs, chars } */
  const entries = new Map()
  const state = {
    loaded: false,
    building: false,
    done: 0,
    total: 0,
    startedAt: 0,
    builtAt: 0,
    buildMs: 0,
    error: null,
    failed: 0,
    seen: 0,
    failures: [],
    cacheBytes: 0,
  }
  let facetsCache = null
  let facetsDirty = true
  let refreshPromise = null
  let manifestWrite = Promise.resolve()
  let cachePromise = null

  const dataDir = resolveDataDir()
  const cacheDir = path.join(dataDir, 'index')
  const manifestPath = path.join(cacheDir, 'manifest.json')

  function loadCache() {
    if (cachePromise !== null) return cachePromise
    cachePromise = (async () => {
    let manifest
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
    } catch {
      return
    }
    if (manifest === null || manifest.version !== INDEX_VERSION || manifest.cacheVersion !== CACHE_VERSION) return
    const sessions = Array.isArray(manifest.sessions) ? manifest.sessions : []
    state.cacheBytes = Number(manifest.bytes) || 0
    const queue = sessions.slice(0, 400)
    let cursor = 0
    const worker = async () => {
      while (cursor < queue.length) {
        const meta = queue[cursor]
        cursor += 1
        if (meta === null || typeof meta !== 'object' || typeof meta.id !== 'string') continue
        try {
          const raw = unpackCache(await fs.readFile(path.join(cacheDir, cacheName(meta.id))))
          const entry = JSON.parse(raw.toString('utf8'))
          if (entry !== null && Array.isArray(entry.docs)) entries.set(meta.id, entry)
        } catch {
          /* A missing or stale cache file is rebuilt from the log. */
        }
      }
    }
    await Promise.all(Array.from({ length: 6 }, worker))
    if (entries.size > 0) {
      state.builtAt = Number(manifest.savedAt) || Date.now()
      state.buildMs = Number(manifest.buildMs) || 0
      /* A missing cache file means the reuse guarantee is incomplete: let the
         first search trigger an incremental fill instead of waiting out the TTL. */
      if (entries.size < Math.min(sessions.length, 400)) state.builtAt = 0
    }
    facetsDirty = true
    })()
    return cachePromise
  }

  async function update(force = false) {
    await loadCache()
    const query = ctx.get('sessionQuery')
    if (query === undefined) throw new Error('sessionQuery is unavailable')
    const records = await query.listSessions()
    const persisted = new Map()
    const persistence = ctx.get('sessionPersistence')
    if (persistence !== undefined && typeof persistence.list === 'function') {
      try {
        for (const snapshot of await persistence.list()) {
          if (snapshot?.header?.id !== undefined) persisted.set(snapshot.header.id, snapshot)
        }
      } catch (error) {
        warn('persistence list failed', error)
      }
    }
    const live = new Map()
    const sessions = ctx.get('sessions')
    if (sessions !== undefined && typeof sessions.list === 'function') {
      for (const session of sessions.list()) live.set(session.id, session)
    }

    /* Newest activity first: a live Session, then recently written logs. */
    records.sort((a, b) => {
      const liveA = live.has(a.header.id) ? 1 : 0
      const liveB = live.has(b.header.id) ? 1 : 0
      if (liveA !== liveB) return liveB - liveA
      const sa = persisted.get(a.header.id)
      const sb = persisted.get(b.header.id)
      return Number(sb?.sizeBytes ?? 0) - Number(sa?.sizeBytes ?? 0)
    })

    const alive = new Set(records.map((record) => record.header.id))
    for (const id of [...entries.keys()]) {
      if (!alive.has(id)) entries.delete(id)
    }

    state.building = true
    state.total = records.length
    state.done = 0
    state.startedAt = Date.now()
    state.error = null
    state.failed = 0
    state.failures = []
    state.seen = records.length
    let changed = false

    for (let offset = 0; offset < records.length; offset += 1) {
      const record = records[offset]
      const id = record.header.id
      const snapshot = persisted.get(id)
      const liveSession = live.get(id)
      let rev = 'stored'
      if (liveSession !== undefined && typeof liveSession.snapshotEvents === 'function') {
        try {
          rev = `live:${liveSession.snapshotEvents().length}`
        } catch {
          rev = 'live'
        }
      } else if (snapshot !== undefined) {
        rev = `${String(snapshot.revision ?? '')}:${String(snapshot.sizeBytes ?? '')}`
      }
      const current = entries.get(id)
      if (!force && current !== undefined && current.rev === rev) {
        state.done += 1
        continue
      }
      try {
        const log = await query.readSession(id)
        const entry = await parseSession(id, log.session ?? record.header, log.events, rev, liveSession !== undefined)
        entries.set(id, entry)
        changed = true
        facetsDirty = true
        await writeSession(entry)
      } catch (error) {
        /* One unreadable log must not remove a previously good entry. */
        state.failed += 1
        if (state.failures.length < 4) state.failures.push({ id, message: messageOf(error) })
        if (current === undefined) warn(`read failed: ${id}`, error)
      }
      state.done += 1
      if (state.done % 3 === 0) await new Promise((resolve) => setImmediate(resolve))
    }

    state.building = false
    state.builtAt = Date.now()
    state.buildMs = state.builtAt - state.startedAt
    if (changed || state.done > 0) await writeManifest()
    return entries
  }

  function ensure(force) {
    return (async () => {
      await loadCache()
      /* A warm cache is served immediately; the refresh runs in the background.
         Only a genuinely cold index waits for the full build. */
      if (!force && entries.size > 0) {
        if (refreshPromise === null && Date.now() - state.builtAt >= 60_000) {
          state.total = Math.max(state.total, entries.size)
          state.done = Math.max(state.done, entries.size)
          state.building = true
          refreshPromise = update(false)
            .catch((error) => {
              state.error = messageOf(error)
              warn('index update failed', error)
              return entries
            })
            .finally(() => {
              state.building = false
              refreshPromise = null
            })
        }
        return entries
      }
      if (refreshPromise !== null) return refreshPromise
      state.building = true
      refreshPromise = update(force === true)
        .catch((error) => {
          state.error = messageOf(error)
          warn('index update failed', error)
          return entries
        })
        .finally(() => {
          state.building = false
          refreshPromise = null
        })
      return refreshPromise
    })()
  }

  async function writeSession(entry) {
    try {
      await fs.mkdir(cacheDir, { recursive: true, mode: 0o700 })
      const body = JSON.stringify(entry)
      const packed = packCache(body)
      const target = path.join(cacheDir, cacheName(entry.id))
      const temporary = `${target}.${process.pid}.tmp`
      await fs.writeFile(temporary, packed, { mode: 0o600 })
      await fs.rename(temporary, target)
      state.cacheBytes += packed.length
    } catch {
      /* Cache is an accelerator; a read-only home must not break search. */
    }
  }

  function writeManifest() {
    const snapshot = {
      version: INDEX_VERSION,
      cacheVersion: CACHE_VERSION,
      savedAt: state.builtAt || Date.now(),
      buildMs: state.buildMs,
      bytes: state.cacheBytes,
      sessions: [...entries.values()].map((entry) => ({
        id: entry.id,
        rev: entry.rev,
        title: entry.title,
        cwd: entry.cwd,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        chars: entry.chars,
      })),
    }
    manifestWrite = manifestWrite
      .then(async () => {
        await fs.mkdir(cacheDir, { recursive: true, mode: 0o700 })
        const target = manifestPath
        const temporary = `${target}.${process.pid}.tmp`
        await fs.writeFile(temporary, JSON.stringify(snapshot), 'utf8', { mode: 0o600 })
        await fs.rename(temporary, target)
      })
      .catch(() => undefined)
    return manifestWrite
  }

  function status() {
    if (facetsDirty) {
      facetsCache = buildFacets(entries)
      facetsDirty = false
    }
    let docs = 0
    let chars = 0
    for (const entry of entries.values()) {
      docs += entry.docs.length
      chars += entry.chars
    }
    return {
      building: state.building,
      progress: { done: state.done, total: state.total },
      builtAt: state.builtAt,
      buildMs: state.buildMs,
      error: state.error,
      failed: state.failed,
      seen: state.seen,
      failures: state.failures,
      sessions: entries.size,
      docs,
      chars,
      cacheMB: Math.round((state.cacheBytes / 1048576) * 10) / 10,
      facets: facetsCache,
    }
  }

  async function search(payload) {
    await loadCache()
    if (entries.size === 0) {
      void ensure(true)
      await waitForFirst(entries, 700)
    } else {
      void ensure(false)
    }
    return runSearch(entries, payload, state)
  }

  async function detail(payload) {
    await loadCache()
    const id = typeof payload.id === 'string' ? payload.id : ''
    const hash = id.lastIndexOf('#')
    if (hash < 0) throw new Error('bad id')
    const sessionId = id.slice(0, hash)
    const rest = id.slice(hash + 1)
    const entry = entries.get(sessionId)
    if (entry === undefined) throw new Error('session not indexed')
    if (rest === 'title') {
      return {
        id,
        kind: 'title',
        role: 'system',
        sessionId,
        title: entry.title,
        cwd: entry.cwd,
        text: entry.title,
        time: entry.updatedAt,
      }
    }
    const index = Number(rest)
    const doc = Number.isInteger(index) ? entry.docs[index] : undefined
    if (doc === undefined) throw new Error('document not indexed')
    return {
      id,
      kind: kindName(doc.k),
      role: roleName(doc.r),
      sessionId,
      title: entry.title,
      cwd: entry.cwd,
      text: doc.text,
      time: doc.ts,
      turn: doc.turn ?? 0,
      step: doc.step ?? 0,
      seq: doc.seq ?? 0,
      tool: doc.n ?? '',
      call: doc.call ?? '',
      ext: doc.ext ?? '',
      files: doc.f ?? [],
    }
  }

  async function stream(payload, emit) {
    await loadCache()
    if (entries.size === 0) {
      void ensure(true)
      await waitForFirst(entries, 700)
    } else {
      void ensure(false)
    }
    const filters = normalizeFilters(payload.filters)
    const started = Date.now()
    const base = {
      took: 0,
      totalSessions: 0,
      totalHits: 0,
      scanned: 0,
      truncated: false,
      state: briefState(state),
    }
    if (filters.sort === 'relevance') {
      /* Relevance needs the whole corpus; stream the sorted groups in batches. */
      const value = runSearch(entries, payload, state)
      const meta = { ...value }
      delete meta.groups
      await emit({ type: 'meta', value: meta })
      for (let offset = 0; offset < value.groups.length; offset += 4) {
        if (!await emit({ type: 'groups', groups: value.groups.slice(offset, offset + 4) })) return
      }
      await emit({
        type: 'done',
        value: {
          took: value.took,
          totalSessions: value.totalSessions,
          totalHits: value.totalHits,
          scanned: value.scanned,
          truncated: value.truncated,
        },
      })
      return
    }

    await emit({ type: 'meta', value: { query: typeof payload.query === 'string' ? payload.query : '', ...base } })
    const ordered = [...entries.values()].sort((a, b) => (
      filters.sort === 'oldest' ? a.updatedAt - b.updatedAt : b.updatedAt - a.updatedAt
    ))
    let totalSessions = 0
    let totalHits = 0
    let scanned = 0
    let truncated = false
    let pending = []
    for (const entry of ordered) {
      if (Date.now() - started > SEARCH_DEADLINE_MS) {
        truncated = true
        break
      }
      const one = runSearch(new Map([[entry.id, entry]]), payload, state)
      if (one.groups.length === 0) continue
      totalSessions += 1
      totalHits += one.totalHits
      scanned += one.scanned
      pending.push(one.groups[0])
      if (pending.length >= 2) {
        if (!await emit({ type: 'groups', groups: pending })) return
        pending = []
      }
      if (totalSessions >= MAX_GROUPS) {
        truncated = true
        break
      }
    }
    if (pending.length > 0) await emit({ type: 'groups', groups: pending })
    await emit({
      type: 'done',
      value: {
        took: Math.round((Date.now() - started) * 10) / 10,
        totalSessions,
        totalHits,
        scanned,
        truncated,
      },
    })
  }

  return {
    ensure,
    status,
    search,
    stream,
    detail,
    reindex() {
      entries.clear()
      state.loaded = true
      facetsDirty = true
      void ensure(true)
    },
  }
}

async function waitForFirst(entries, ms) {
  const started = Date.now()
  while (entries.size === 0 && Date.now() - started < ms) {
    await new Promise((resolve) => setTimeout(resolve, 40))
  }
}

function cacheName(id) {
  return `${id.replace(/[^a-zA-Z0-9._-]/g, '_')}.json.zst`
}

function resolveDataDir() {
  const profile = process.env.DSH_PROFILE_DIR
  if (typeof profile === 'string' && profile !== '') return path.join(profile, 'plugin-data', CALLER)
  const home = process.env.DSH_HOME
  if (typeof home === 'string' && home !== '') return path.join(home, 'plugin-data', CALLER)
  return path.join(os.homedir(), '.dsh', 'plugin-data', CALLER)
}

// #endregion

// #region Parsing --------------------------------------------------------------

/**
 * Fold one Session log into compact searchable documents.
 * @param id - Session id.
 * @param header - Session header (`cwd`, `createdAt`).
 * @param events - Complete logical event log.
 * @param rev - Cheap source revision used to skip unchanged Sessions later.
 * @param live - Whether this Session is currently live.
 */
async function parseSession(id, header, events, rev, live) {
  const docs = []
  let title = ''
  let turn = 0
  let step = 0
  let updatedAt = typeof header?.createdAt === 'number' ? header.createdAt : 0
  let chars = 0
  const toolNames = new Map()

  const add = (doc) => {
    if (typeof doc.text !== 'string') doc.text = ''
    if ((doc.k === KIND.tool || doc.k === KIND.output) && doc.text.length > MAX_TOOL_CHARS) doc.text = doc.text.slice(0, MAX_TOOL_CHARS)
    if (doc.text.length > MAX_DOC_CHARS) doc.text = doc.text.slice(0, MAX_DOC_CHARS)
    if (doc.text === '' && doc.k !== 'f') return
    if (doc.text.length > 0) chars += doc.text.length
    docs.push(doc)
    /* A path named in prose is a first-class row too: file-type filters and
       "open the file" results read better as their own hit. */
    if (doc.k !== KIND.file && Array.isArray(doc.f) && doc.f.length > 0) {
      for (const file of doc.f) {
        const ext = extOf(file)
        if (ext === '') continue
        docs.push({
          k: KIND.file,
          r: doc.r,
          ts: doc.ts,
          seq: doc.seq,
          turn: doc.turn,
          step: doc.step,
          text: file,
          ext,
          call: doc.call,
          f: [file],
        })
        chars += file.length
      }
    }
  }

  for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
    /* Keep the Host's HTTP loop responsive while one large log is folded. */
    if (eventIndex > 0 && eventIndex % 2000 === 0) await new Promise((resolve) => setImmediate(resolve))
    const event = events[eventIndex]
    if (event === null || typeof event !== 'object') continue
    const time = typeof event.time === 'number' ? event.time : 0
    if (time > updatedAt) updatedAt = time
    const seq = typeof event.seq === 'number' ? event.seq : 0
    const data = event.data !== null && typeof event.data === 'object' ? event.data : {}

    switch (event.type) {
      case 'session/title': {
        if (typeof data.title === 'string' && data.title !== '') title = data.title
        break
      }
      case 'turn/start': {
        if (typeof data.turn === 'number') turn = data.turn
        break
      }
      case 'step/start': {
        if (typeof data.step === 'number') step = data.step
        break
      }
      case 'user/message': {
        const blocks = Array.isArray(data.content) ? data.content : []
        for (const block of blocks) {
          if (block?.type === 'text' && typeof block.text === 'string') {
            add({ k: KIND.message, r: 'u', ts: time, seq, turn, step, text: block.text, f: pathsOf(block.text) })
          } else if (block?.type === 'image' || block?.type === 'attachment' || block?.type === 'file') {
            const name = nameOfBlock(block)
            add({ k: KIND.attachment, r: 'u', ts: time, seq, turn, step, text: name })
            if (name !== '') add({ k: KIND.file, r: 'u', ts: time, seq, turn, step, text: name, ext: extOf(name), f: [name] })
          }
        }
        break
      }
      case 'assistant/message': {
        if (typeof data.turn === 'number') turn = data.turn
        if (typeof data.step === 'number') step = data.step
        const message = data.message
        const blocks = message !== null && typeof message === 'object' && Array.isArray(message.content) ? message.content : []
        for (const block of blocks) {
          if (block === null || typeof block !== 'object') continue
          if (block.type === 'text' && typeof block.text === 'string' && block.text !== '') {
            add({ k: KIND.message, r: 'a', ts: time, seq, turn, step, text: block.text, f: pathsOf(block.text) })
          } else if (block.type === 'reasoning' && typeof block.text === 'string' && block.text !== '') {
            add({ k: KIND.reasoning, r: 'a', ts: time, seq, turn, step, text: block.text })
          } else if (block.type === 'tool-call') {
            /* Tool calls arrive as their own events; avoid indexing them twice. */
            if (typeof block.id === 'string' && typeof block.name === 'string') toolNames.set(block.id, block.name)
          } else if (block.type === 'image' || block.type === 'attachment' || block.type === 'file') {
            const name = nameOfBlock(block)
            add({ k: KIND.attachment, r: 'a', ts: time, seq, turn, step, text: name })
            if (name !== '') add({ k: KIND.file, r: 'a', ts: time, seq, turn, step, text: name, ext: extOf(name), f: [name] })
          }
        }
        break
      }
      case 'tool/call': {
        const callId = typeof data.callId === 'string' ? data.callId : ''
        const name = typeof data.name === 'string' ? data.name : ''
        if (callId !== '' && name !== '') toolNames.set(callId, name)
        const args = typeof data.arguments === 'string' ? data.arguments : stringify(data.arguments)
        const text = `${name} ${args}`.trim()
        const files = filesOfToolCall(args)
        add({
          k: KIND.tool,
          r: 'a',
          ts: time,
          seq,
          turn: typeof data.turn === 'number' ? data.turn : turn,
          step: typeof data.step === 'number' ? data.step : step,
          text,
          n: name,
          call: callId,
          f: files,
        })
        break
      }
      case 'tool/result': {
        const callId = typeof data.toolCallId === 'string' ? data.toolCallId : ''
        const name = toolNames.get(callId) ?? (typeof data.name === 'string' ? data.name : '')
        const message = data.message
        const blocks = message !== null && typeof message === 'object' && Array.isArray(message.content) ? message.content : []
        const parts = []
        const files = []
        for (const block of blocks) {
          if (block?.type === 'text' && typeof block.text === 'string') parts.push(block.text)
          else if (block?.type === 'image' || block?.type === 'attachment' || block?.type === 'file') {
            const file = nameOfBlock(block)
            if (file !== '') files.push(file)
          }
        }
        const text = parts.join('\n\n')
        if (text !== '' || files.length > 0) {
          add({
            k: KIND.output,
            r: 't',
            ts: time,
            seq,
            turn: typeof data.turn === 'number' ? data.turn : turn,
            step: typeof data.step === 'number' ? data.step : step,
            text: `${name === '' ? '' : `${name}\n`}${text}`.trim(),
            n: name,
            call: callId,
            f: files,
          })
        }
        break
      }
      case 'compaction/summary': {
        const text = typeof data.summary === 'string' ? data.summary : typeof data.text === 'string' ? data.text : ''
        if (text !== '') add({ k: KIND.summary, r: 's', ts: time, seq, turn, step, text })
        break
      }
      default:
        break
    }
  }

  if (title === '') {
    const first = docs.find((doc) => doc.k === KIND.message && doc.r === 'u')
    title = first === undefined ? '' : preview(first.text, 64)
  }

  return {
    id,
    cwd: typeof header?.cwd === 'string' ? header.cwd : '',
    title,
    createdAt: typeof header?.createdAt === 'number' ? header.createdAt : 0,
    updatedAt,
    rev,
    live,
    chars,
    docs,
  }
}

function nameOfBlock(block) {
  for (const key of ['name', 'filename', 'file_name', 'path', 'title', 'alt']) {
    if (typeof block[key] === 'string' && block[key] !== '') return block[key]
  }
  return typeof block.mediaType === 'string' ? block.mediaType : ''
}

function stringify(value) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

/** File paths named in a tool call's JSON arguments. */
function filesOfToolCall(args) {
  const out = []
  if (args === '') return out
  let value
  try {
    value = JSON.parse(args)
  } catch {
    return pathsOf(args)
  }
  const keys = new Set(['path', 'file_path', 'filePath', 'filepath', 'target', 'filename', 'file', 'paths', 'files', 'from', 'to', 'source', 'destination'])
  const visit = (node, depth) => {
    if (out.length >= MAX_FILES_PER_DOC || depth > 6) return
    if (typeof node === 'string') {
      for (const candidate of pathsOf(node)) {
        if (out.length >= MAX_FILES_PER_DOC) return
        if (!out.includes(candidate)) out.push(candidate)
      }
      return
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1)
      return
    }
    if (node !== null && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        if (keys.has(key) && typeof child === 'string') {
          const file = cleanPath(child)
          if (file !== null && !out.includes(file)) out.push(file)
        } else {
          visit(child, depth + 1)
        }
      }
    }
  }
  visit(value, 0)
  return out.slice(0, MAX_FILES_PER_DOC)
}

/** Path-like tokens embedded in prose or an unparsable argument string. */
function pathsOf(text) {
  if (typeof text !== 'string' || text === '') return []
  const out = []
  const pattern = /(?:[A-Za-z]:)?(?:[^\s"'`<>()[\]{}，。；：、,;!?]+[\\/])*[^\s"'`<>()[\]{}，。；：、,;!?]+\.([A-Za-z0-9]{1,10})\b/g
  let match
  while ((match = pattern.exec(text)) !== null && out.length < MAX_FILES_PER_DOC) {
    const raw = match[0]
    if (raw.includes('://')) continue
    const file = cleanPath(raw)
    if (file === null) continue
    if (!out.includes(file)) out.push(file)
  }
  return out
}

function cleanPath(value) {
  if (typeof value !== 'string') return null
  let text = value.trim().replace(/^[`"'([{]+/, '').replace(/[`"'\])},.;:]+$/, '')
  if (text.length < 3 || text.length > MAX_PATH_CHARS) return null
  if (text.includes('://') || text.startsWith('#')) return null
  const ext = extOf(text)
  if (ext === '' || !FILE_EXTENSIONS.has(ext)) return null
  return text
}

function extOf(value) {
  if (typeof value !== 'string') return ''
  const clean = value.split(/[?#]/)[0]
  const dot = clean.lastIndexOf('.')
  if (dot < 0 || dot === clean.length - 1) return ''
  const ext = clean.slice(dot + 1).toLowerCase()
  return /^[a-z0-9]{1,10}$/.test(ext) ? ext : ''
}

function preview(text, length) {
  const flat = String(text).replace(/\s+/g, ' ').trim()
  return flat.length > length ? `${flat.slice(0, length)}…` : flat
}

// #endregion

// #region Search ---------------------------------------------------------------

function runSearch(entries, payload, state) {
  const started = Date.now()
  const query = typeof payload.query === 'string' ? payload.query.trim() : ''
  if (query === '' || query.length > MAX_QUERY_CHARS) {
    if (query.length > MAX_QUERY_CHARS) throw new Error(`query is longer than ${MAX_QUERY_CHARS} characters`)
    return emptyResult(state, started)
  }
  const options = normalizeOptions(payload.options)
  const filters = normalizeFilters(payload.filters)
  const matcher = buildMatcher(query, options)
  const allowedKinds = new Set(filters.kinds)
  const allowedFileKinds = new Set(filters.fileKinds)
  const groups = []
  let totalHits = 0
  let matchedSessions = 0
  let scanned = 0
  let truncated = false

  for (const entry of entries.values()) {
    if (Date.now() - started > SEARCH_DEADLINE_MS) {
      truncated = true
      break
    }
    if (filters.workspaces.length > 0 && !filters.workspaces.includes(entry.cwd)) continue
    if (filters.sessionId !== '' && entry.id !== filters.sessionId) continue
    if (filters.since !== null && entry.updatedAt < filters.since) continue
    if (filters.until !== null && entry.createdAt > filters.until) continue

    const hits = []
    let groupTotal = 0
    if (filters.includeTitle && allowedKinds.has(KIND.message) && filters.position === 'any' && allowedFileKinds.size === 0 && filters.exts.length === 0) {
      const ranges = matcher(entry.title)
      if (ranges.length > 0) {
        hits.push({
          id: `${entry.id}#title`,
          kind: 'title',
          role: 'system',
          time: entry.updatedAt,
          turn: 0,
          seq: -1,
          call: '',
          score: 20 + recencyScore(entry.updatedAt),
          ranges,
          snippet: snippetOf(entry.title, ranges),
          anchor: entry.title.slice(ranges[0][0], Math.min(ranges[0][1], ranges[0][0] + 40)),
          files: [],
        })
      }
    }

    for (let index = 0; index < entry.docs.length; index += 1) {
      const doc = entry.docs[index]
      if (!allowedKinds.has(doc.k)) continue
      if (!positionMatches(filters.position, doc.r)) continue
      /* A file filter narrows to hits whose document actually references a file
         of that kind. A tool call that names an .mp4 (and whose arguments carry
         the query) therefore still matches; requiring a bare path row would lose
         exactly the most useful hit. */
      if (allowedFileKinds.size > 0 || filters.exts.length > 0) {
        if (!docReferencesFile(doc, allowedFileKinds, filters.exts)) continue
      }
      if (filters.since !== null && doc.ts < filters.since) continue
      if (filters.until !== null && doc.ts > filters.until) continue
      scanned += 1
      if (scanned % 500 === 0 && Date.now() - started > SEARCH_DEADLINE_MS) {
        truncated = true
        break
      }
      const ranges = matcher(doc.text)
      if (ranges.length === 0) continue
      totalHits += ranges.length
      groupTotal += 1
      if (hits.length >= MAX_CANDIDATES_PER_SESSION) continue
      hits.push({
        id: `${entry.id}#${index}`,
        kind: kindName(doc.k),
        role: roleName(doc.r),
        time: doc.ts,
        turn: doc.turn ?? 0,
        step: doc.step ?? 0,
        seq: doc.seq ?? 0,
        tool: doc.n ?? '',
        call: doc.call ?? '',
        ext: doc.ext ?? '',
        score: Math.min(ranges.length, 6) * 2 + kindWeight(doc.k) + recencyScore(doc.ts),
        matches: ranges.length,
        ranges,
        snippet: snippetOf(doc.text, ranges),
        anchor: doc.text.slice(ranges[0][0], Math.min(ranges[0][1], ranges[0][0] + 40)),
        files: (doc.f ?? []).slice(0, 4),
      })
      if (Date.now() - started > SEARCH_DEADLINE_MS) {
        truncated = true
        break
      }
    }

    if (hits.length > 0) {
      matchedSessions += 1
      if (filters.sort === 'newest') hits.sort((a, b) => b.time - a.time || b.score - a.score)
      else if (filters.sort === 'oldest') hits.sort((a, b) => a.time - b.time || b.score - a.score)
      else hits.sort((a, b) => b.score - a.score || b.time - a.time)
      const best = hits[0]
      groups.push({
        id: entry.id,
        title: entry.title,
        cwd: entry.cwd,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        live: entry.live,
        best: best.score,
        total: groupTotal,
        hits: hits.slice(0, MAX_HITS_PER_SESSION),
      })
    }
    if (truncated) break
  }

  groups.sort((a, b) => {
    if (filters.sort === 'newest') return b.updatedAt - a.updatedAt || b.best - a.best
    if (filters.sort === 'oldest') return a.updatedAt - b.updatedAt || b.best - a.best
    return b.best - a.best || b.updatedAt - a.updatedAt
  })
  if (groups.length > MAX_GROUPS) groups.length = MAX_GROUPS

  return {
    query,
    took: Math.round((Date.now() - started) * 10) / 10,
    totalSessions: matchedSessions,
    totalHits,
    scanned,
    truncated,
    groups,
    state: briefState(state),
  }
}

function emptyResult(state, started) {
  return {
    query: '',
    took: Math.round((Date.now() - started) * 10) / 10,
    totalSessions: 0,
    totalHits: 0,
    scanned: 0,
    truncated: false,
    groups: [],
    state: briefState(state),
  }
}

function briefState(state) {
  return {
    building: state.building,
    progress: { done: state.done, total: state.total },
    sessions: state.building || state.total === 0 ? undefined : state.total,
  }
}

function normalizeOptions(value) {
  const input = value !== null && typeof value === 'object' ? value : {}
  return {
    regex: input.regex === true,
    caseSensitive: input.caseSensitive === true,
    wholeWord: input.wholeWord === true,
  }
}

function normalizeFilters(value) {
  const input = value !== null && typeof value === 'object' ? value : {}
  const kinds = Array.isArray(input.kinds)
    ? input.kinds.filter((kind) => DEFAULT_KINDS.includes(kind) || kind === KIND.reasoning)
    : DEFAULT_KINDS
  return {
    position: ['any', 'user', 'assistant'].includes(input.position) ? input.position : 'any',
    kinds: kinds.length === 0 ? DEFAULT_KINDS : kinds,
    fileKinds: Array.isArray(input.fileKinds) ? input.fileKinds.filter((kind) => typeof kind === 'string') : [],
    exts: Array.isArray(input.exts) ? input.exts.filter((ext) => typeof ext === 'string').slice(0, 40) : [],
    workspaces: Array.isArray(input.workspaces) ? input.workspaces.filter((cwd) => typeof cwd === 'string').slice(0, 80) : [],
    sort: ['relevance', 'newest', 'oldest'].includes(input.sort) ? input.sort : 'relevance',
    since: numberOrNull(input.since),
    until: numberOrNull(input.until),
    includeTitle: input.includeTitle !== false,
    sessionId: typeof input.sessionId === 'string' ? input.sessionId : '',
  }
}

function docReferencesFile(doc, kinds, exts) {
  const files = doc.k === KIND.file
    ? [[doc.ext ?? '', doc.text ?? '']]
    : (Array.isArray(doc.f) ? doc.f : []).map((file) => [extOf(file), file])
  for (const [ext, file] of files) {
    if (ext === '') continue
    if (kinds.size > 0 && !kinds.has(EXT_KIND.get(ext) ?? 'other')) continue
    if (exts.length > 0 && !exts.includes(ext)) continue
    return true
  }
  return false
}

function positionMatches(position, role) {
  if (position === 'any') return true
  if (position === 'user') return role === 'u'
  return role === 'a' || role === 't' || role === 's'
}

function recencyScore(time) {
  if (typeof time !== 'number' || time <= 0) return 0
  const days = (Date.now() - time) / 86_400_000
  if (days < 1) return 4
  if (days < 7) return 2
  if (days < 30) return 1
  return 0
}

function kindWeight(kind) {
  switch (kind) {
    case KIND.message: return 12
    case KIND.file: return 8
    case KIND.summary: return 6
    case KIND.tool: return 3
    case KIND.attachment: return 3
    case KIND.output: return 1
    default: return 0
  }
}

function kindName(kind) {
  switch (kind) {
    case KIND.message: return 'message'
    case KIND.file: return 'file'
    case KIND.tool: return 'tool'
    case KIND.output: return 'output'
    case KIND.reasoning: return 'reasoning'
    case KIND.attachment: return 'attachment'
    case KIND.summary: return 'summary'
    default: return 'message'
  }
}

function roleName(role) {
  switch (role) {
    case 'u': return 'user'
    case 'a': return 'assistant'
    case 't': return 'tool'
    case 's': return 'system'
    default: return 'assistant'
  }
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// #endregion

// #region Matcher --------------------------------------------------------------

const UNSAFE_PATTERNS = [
  /(\([^()]*[+*][^()]*\)|\[[^\]]*\][+*])[+*]/, // nested quantifiers: (a+)+, [ab]*+
  /\\[1-9]/, // backreferences
  /(\.\*){3,}/, // .*.*.*
  /\((?:[^()]*\|[^()]*)\)[+*{]/, // (a|aa)+ style overlapping alternatives
]

function buildMatcher(query, options) {
  if (options.regex) {
    if (query.length > MAX_QUERY_CHARS) throw new Error('pattern too long')
    for (const unsafe of UNSAFE_PATTERNS) {
      if (unsafe.test(query)) throw new Error('该正则可能造成回溯爆炸，请改写后再试')
    }
    let regex
    try {
      regex = new RegExp(query, `g${options.caseSensitive ? '' : 'i'}u`)
    } catch (error) {
      throw new Error(`正则无效：${messageOf(error)}`)
    }
    return (text) => collect(regex, text)
  }

  const escaped = escapeRegExp(query)
  const pattern = options.wholeWord
    ? `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`
    : escaped
  const flags = `g${options.caseSensitive ? '' : 'i'}u`
  let regex
  try {
    regex = new RegExp(pattern, flags)
  } catch (error) {
    throw new Error(`检索式无效：${messageOf(error)}`)
  }

  /* Fast path: a query without cased letters and without whole-word rules is a
     plain substring for both `indexOf` and the regex engine. */
  const cased = /[A-Za-z]/.test(query)
  if (!options.caseSensitive && !cased && !options.wholeWord) {
    return (text) => {
      const ranges = []
      let from = 0
      while (ranges.length < MAX_MATCHES_PER_DOC) {
        const index = text.indexOf(query, from)
        if (index < 0) break
        ranges.push([index, index + query.length])
        from = index + Math.max(1, query.length)
      }
      return ranges
    }
  }
  return (text) => collect(regex, text)
}

function collect(regex, text) {
  const ranges = []
  regex.lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex += 1
      if (regex.lastIndex > text.length) break
      continue
    }
    ranges.push([match.index, match.index + match[0].length])
    if (ranges.length >= MAX_MATCHES_PER_DOC) break
  }
  return ranges
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function snippetOf(text, ranges) {
  const first = ranges[0]
  let from = Math.max(0, first[0] - 72)
  if (from > 0) {
    const boundary = text.lastIndexOf(' ', from)
    const line = text.lastIndexOf('\n', from)
    const cut = Math.max(boundary, line)
    if (cut >= first[0] - 160 && cut >= 0) from = cut + 1
  }
  const to = Math.min(text.length, first[0] + 210)
  const body = text.slice(from, to)
  const prefix = from > 0 ? '…' : ''
  const shift = prefix.length
  const local = ranges
    .filter(([start, end]) => start >= from && end <= to)
    .map(([start, end]) => [start - from + shift, end - from + shift])
  return {
    text: `${prefix}${body}${to < text.length ? '…' : ''}`,
    offset: from,
    ranges: local,
  }
}

// #endregion

// #region Facets ---------------------------------------------------------------

function buildFacets(entries) {
  const workspaces = new Map()
  const exts = new Map()
  let docs = 0
  let chars = 0
  for (const entry of entries.values()) {
    docs += entry.docs.length
    chars += entry.chars
    if (entry.cwd !== '') {
      const current = workspaces.get(entry.cwd) ?? { cwd: entry.cwd, sessions: 0, hits: 0 }
      current.sessions += 1
      workspaces.set(entry.cwd, current)
    }
    for (const doc of entry.docs) {
      if (doc.k !== KIND.file || doc.ext === '') continue
      const stat = exts.get(doc.ext) ?? { ext: doc.ext, kind: EXT_KIND.get(doc.ext) ?? 'other', count: 0 }
      stat.count += 1
      exts.set(doc.ext, stat)
    }
  }
  return {
    workspaces: [...workspaces.values()].sort((a, b) => b.sessions - a.sessions).slice(0, 60),
    exts: [...exts.values()].sort((a, b) => b.count - a.count).slice(0, 40),
    sessions: entries.size,
    docs,
    chars,
  }
}

// #endregion

