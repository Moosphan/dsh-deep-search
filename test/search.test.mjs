import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const temp = await mkdtemp(path.join(os.tmpdir(), 'dsh-session-search-'))
process.env.DSH_PROFILE_DIR = temp

const { apply, parseSession } = await import('../index.js')

const now = Date.now()

function event(type, seq, time, data) {
  return { type, seq, time, data }
}

const eventsA = [
  event('session', 0, now - 2 * 86_400_000, { id: 'A', createdAt: now - 2 * 86_400_000, cwd: '/work/a' }),
  event('session/title', 1, now - 2 * 86_400_000, { title: '同行日报排查' }),
  event('turn/start', 2, now - 2 * 86_400_000, { turn: 1 }),
  event('user/message', 3, now - 2 * 86_400_000, {
    content: [{ type: 'text', text: '帮我查一下同行日报和 cover.png，然后改 src/app.ts' }],
  }),
  event('assistant/message', 4, now - 2 * 86_400_000 + 1000, {
    turn: 1,
    step: 1,
    message: { role: 'assistant', content: [{ type: 'text', text: '我用 apply_patch 改了 src/app.ts，成功。' }] },
  }),
  event('tool/call', 5, now - 2 * 86_400_000 + 1200, {
    turn: 1,
    step: 1,
    callId: 'call_1',
    name: 'apply_patch',
    arguments: JSON.stringify({ path: 'src/app.ts' }),
  }),
  event('tool/result', 6, now - 2 * 86_400_000 + 1400, {
    turn: 1,
    step: 1,
    toolCallId: 'call_1',
    message: { role: 'tool', content: [{ type: 'text', text: 'patched ok, build finished' }] },
  }),
]

const eventsB = [
  event('session', 0, now - 3_600_000, { id: 'B', createdAt: now - 3_600_000, cwd: '/work/b' }),
  event('turn/start', 1, now - 3_600_000, { turn: 1 }),
  event('user/message', 2, now - 3_600_000, { content: [{ type: 'text', text: 'Another Failure in build.log' }] }),
  event('assistant/message', 3, now - 3_600_000 + 500, {
    turn: 1,
    step: 1,
    message: { role: 'assistant', content: [{ type: 'text', text: 'Fixed the bug in build.log.' }] },
  }),
]

const sessions = new Map([
  ['A', { header: { id: 'A', cwd: '/work/a', createdAt: now - 2 * 86_400_000 }, events: eventsA }],
  ['B', { header: { id: 'B', cwd: '/work/b', createdAt: now - 3_600_000 }, events: eventsB }],
])

/** A minimal Host context capturing the registered route. */
function install() {
  let handler
  const ctx = {
    effect: (factory) => factory(),
    get: (name) => {
      if (name === 'sessionQuery') {
        return {
          listSessions: async () =>
            [...sessions.values()].map(({ header }) => ({ header, live: false, persisted: true })),
          readSession: async (id) => ({
            session: sessions.get(id).header,
            events: sessions.get(id).events,
          }),
        }
      }
      if (name === 'sessionPersistence') {
        return {
          list: async () =>
            [...sessions.values()].map(({ header }, index) => ({
              header,
              revision: `rev-${header.id}`,
              sizeBytes: 100 + index,
            })),
        }
      }
      return undefined
    },
    webServer: {
      register(entry) {
        handler = entry.handler
        return () => undefined
      },
    },
  }
  apply(ctx)
  const call = async (body) => {
    const chunks = [Buffer.from(JSON.stringify(body))]
    const req = {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) yield chunk
      },
    }
    let status = 0
    let payload = ''
    const res = {
      setHeader() {},
      end(text) {
        payload = text
      },
      set statusCode(value) {
        status = value
      },
      get statusCode() {
        return status
      },
    }
    await handler(req, res)
    return { status, body: JSON.parse(payload) }
  }
  call.stream = async (body) => {
    const req = {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify(body))
      },
    }
    const chunks = []
    const res = {
      setHeader() {},
      write(text) {
        chunks.push(text)
      },
      end(text) {
        if (text !== undefined) chunks.push(text)
      },
    }
    await handler(req, res)
    return chunks.join('')
  }
  return call
}

const call = install()

async function search(query, options = {}, filters = {}) {
  const response = await call({ action: 'search', query, options, filters })
  assert.equal(response.status, 200, JSON.stringify(response.body))
  assert.equal(response.body.ok, true)
  return response.body.value
}

test('literal keyword matches titles and messages', async () => {
  const value = await search('日报')
  assert.equal(value.totalSessions, 1)
  assert.equal(value.groups[0].id, 'A')
  assert.ok(value.groups[0].hits.some((hit) => hit.kind === 'title'))
  assert.ok(value.groups[0].hits.some((hit) => hit.kind === 'message' && hit.role === 'user'))
  for (const hit of value.groups[0].hits) {
    for (const [start, end] of hit.snippet.ranges) {
      assert.equal(hit.snippet.text.slice(start, end), '日报')
    }
  }
})

test('case-insensitive literal search', async () => {
  const value = await search('failure')
  assert.equal(value.groups.length, 1)
  assert.equal(value.groups[0].id, 'B')
})

test('regex search', async () => {
  const value = await search('build\\.log', { regex: true })
  assert.equal(value.groups[0].id, 'B')
  assert.ok(value.groups[0].hits.length >= 2)
})

test('invalid regex is rejected', async () => {
  const response = await call({ action: 'search', query: '(', options: { regex: true } })
  assert.equal(response.status, 500)
  assert.match(response.body.error.message, /正则无效/)
})

test('unsafe regex is rejected', async () => {
  const response = await call({ action: 'search', query: '(a+)+b', options: { regex: true } })
  assert.equal(response.status, 500)
  assert.match(response.body.error.message, /回溯/)
})

test('speaker filter', async () => {
  const value = await search('日报', {}, { position: 'user' })
  assert.equal(value.groups.length, 1)
  assert.ok(value.groups[0].hits.every((hit) => hit.role === 'user'))

  const assistant = await search('build.log', {}, { position: 'assistant' })
  assert.equal(assistant.groups.length, 1)
  assert.ok(assistant.groups[0].hits.every((hit) => hit.role === 'assistant' || hit.role === 'tool'))
})

test('workspace filter', async () => {
  const value = await search('build', {}, { workspaces: ['/work/b'] })
  assert.equal(value.groups.length, 1)
  assert.equal(value.groups[0].id, 'B')
})

test('time filter', async () => {
  const value = await search('日报', {}, { since: now - 86_400_000 })
  assert.equal(value.groups.length, 0)
})

test('file path documents and file kind filter', async () => {
  const value = await search('app.ts', {}, { kinds: ['f'] })
  assert.equal(value.groups.length, 1)
  assert.ok(value.groups[0].hits.every((hit) => hit.kind === 'file'))

  const codeOnly = await search('app.ts', {}, { kinds: ['f'], fileKinds: ['code'] })
  assert.equal(codeOnly.groups.length, 1)

  const imageOnly = await search('app.ts', {}, { kinds: ['f'], fileKinds: ['image'] })
  assert.equal(imageOnly.groups.length, 0)
})

test('extension filter', async () => {
  const value = await search('cover', {}, { kinds: ['f'], exts: ['png'] })
  assert.equal(value.groups.length, 1)
  assert.ok(value.groups[0].hits.some((hit) => hit.ext === 'png'))
})

test('file-type filter keeps prose that references that kind', async () => {
  const value = await search('同行日报', {}, { fileKinds: ['image'] })
  assert.equal(value.groups.length, 1)
  assert.ok(value.groups[0].hits.some((hit) => hit.kind === 'message' && hit.role === 'user'))
})

test('detail returns the full matched document', async () => {
  const value = await search('patched ok')
  const hit = value.groups[0].hits.find((item) => item.kind === 'output')
  assert.ok(hit)
  assert.equal(hit.call, 'call_1')
  assert.equal(hit.turn, 1)
  assert.ok(hit.seq > 0)
  const detail = await call({ action: 'detail', id: hit.id })
  assert.equal(detail.status, 200)
  assert.match(detail.body.value.text, /patched ok/)
})

test('streaming search emits meta, groups, and done', async () => {
  const text = await call.stream({ action: 'search', query: '日报', stream: true, filters: {} })
  const lines = text.trim().split('\n').map((line) => JSON.parse(line))
  assert.equal(lines[0].type, 'meta')
  assert.equal(lines[0].value.groups, undefined)
  assert.ok(lines.some((line) => line.type === 'groups' && Array.isArray(line.groups)))
  assert.equal(lines[lines.length - 1].type, 'done')
})

test('newest streaming walks the most recent session first', async () => {
  const text = await call.stream({ action: 'search', query: 'build', stream: true, filters: { sort: 'newest' } })
  const lines = text.trim().split('\n').map((line) => JSON.parse(line))
  const groups = lines.filter((line) => line.type === 'groups').flatMap((line) => line.groups)
  assert.ok(groups.length >= 1)
  assert.equal(groups[0].id, 'B')
  assert.equal(lines[lines.length - 1].type, 'done')
})

test('second search reuses the warm index', async () => {
  const value = await search('build')
  assert.equal(value.state.building, false)
  assert.ok(value.took >= 0)
})

test('cache survives a fresh index instance', async () => {
  const { apply: applyAgain } = await import('../index.js?again')
  const callAgain = (() => {
    let handler
    const ctx = {
      effect: (factory) => factory(),
      get: (name) => {
        if (name === 'sessionQuery') {
          return {
            listSessions: async () => [...sessions.values()].map(({ header }) => ({ header })),
            readSession: async () => {
              throw new Error('cache should avoid reading logs')
            },
          }
        }
        if (name === 'sessionPersistence') return { list: async () => [] }
        return undefined
      },
      webServer: {
        register(entry) {
          handler = entry.handler
        },
      },
    }
    applyAgain(ctx)
    return async (body) => {
      const req = {
        method: 'POST',
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        async *[Symbol.asyncIterator]() {
          yield Buffer.from(JSON.stringify(body))
        },
      }
      let payload = ''
      const res = {
        setHeader() {},
        end(text) {
          payload = text
        },
      }
      await handler(req, res)
      return JSON.parse(payload)
    }
  })()
  const warm = await callAgain({
    action: 'search',
    query: '日报',
    options: {},
    filters: { since: now - 10 * 86_400_000 },
  })
  assert.equal(warm.ok, true)
  assert.ok(warm.value.groups.length >= 1)
})

test('incremental parse matches a full parse', async () => {
  const extra = [
    event('tool/call', 7, now, {
      turn: 2,
      step: 1,
      callId: 'call_2',
      name: 'bash',
      arguments: JSON.stringify({ command: 'grep -R timeout .' }),
    }),
    event('tool/result', 8, now + 10, {
      turn: 2,
      step: 1,
      toolCallId: 'call_2',
      message: { role: 'tool', content: [{ type: 'text', text: 'timeout found in deploy.log' }] },
    }),
    event('assistant/message', 9, now + 20, {
      turn: 2,
      step: 1,
      message: { role: 'assistant', content: [{ type: 'text', text: 'Incremental tail answer.' }] },
    }),
  ]
  const full = await parseSession('I', { cwd: '/work/i', createdAt: now - 1000 }, [...eventsA, ...extra], 'r1', true)
  const base = await parseSession('I', { cwd: '/work/i', createdAt: now - 1000 }, eventsA, 'r0', true)
  const incremental = await parseSession('I', { cwd: '/work/i', createdAt: now - 1000 }, [...eventsA, ...extra], 'r1', true, base)
  assert.deepEqual(
    incremental.docs.map((doc) => [doc.k, doc.r, doc.text]),
    full.docs.map((doc) => [doc.k, doc.r, doc.text]),
  )
  assert.equal(incremental.lastSeq, full.lastSeq)
  assert.equal(incremental.updatedAt, full.updatedAt)
})

test.after(async () => {
  await rm(temp, { recursive: true, force: true })
})
