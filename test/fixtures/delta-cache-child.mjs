import { mkdtemp, readdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const temp = await mkdtemp(path.join(os.tmpdir(), 'dsh-delta-'))
process.env.DSH_PROFILE_DIR = temp
process.env.DSH_SEARCH_TTL_MS = '0'

const now = Date.now()
const header = { id: 'L', cwd: '/work/L', createdAt: now, updatedAt: now }
const events = [
  { type: 'session', seq: 0, time: now, data: { id: 'L', createdAt: now, cwd: '/work/L' } },
  { type: 'user/message', seq: 1, time: now, data: { content: [{ type: 'text', text: 'delta needle first' }] } },
]
let revision = 1

const { apply } = await import('../../index.js?delta-child')

let handler
const ctx = {
  effect: (factory) => factory(),
  get: (name) => {
    if (name === 'sessionQuery') {
      return {
        listSessions: async () => [{ header }],
        readSession: async () => ({ session: header, events }),
      }
    }
    if (name === 'sessionPersistence') {
      return { list: async () => [{ header, revision: String(revision), sizeBytes: revision * 10 }] }
    }
    return undefined
  },
  webServer: { register(entry) { handler = entry.handler } },
}
apply(ctx)

async function call(body) {
  const req = {
    method: 'POST',
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify(body)) },
  }
  let text = ''
  const res = { setHeader() {}, end(value) { text = value } }
  await handler(req, res)
  return JSON.parse(text)
}
async function waitIdle() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const status = (await call({ action: 'status' })).value
    if (!status.building) return
    await new Promise((resolve) => setTimeout(resolve, 30))
  }
  throw new Error('index did not settle')
}

await call({ action: 'search', query: 'needle', options: {}, filters: {} })
await waitIdle()
events.push({
  type: 'assistant/message',
  seq: 2,
  time: now + 1,
  data: { turn: 2, step: 1, message: { role: 'assistant', content: [{ type: 'text', text: 'delta needle second' }] } },
})
revision = 2
await call({ action: 'search', query: 'needle', options: {}, filters: {} })
await waitIdle()
await new Promise((resolve) => setTimeout(resolve, 200))

const indexDir = path.join(temp, 'plugin-data', 'deep-search', 'index')
const files = await readdir(indexDir)
const deltaCount = files.filter((name) => name.endsWith('.delta.zst')).length

const { apply: applyAgain } = await import('../../index.js?delta-child-again')
let handlerAgain
const replay = {
  effect: (factory) => factory(),
  get: (name) => {
    if (name === 'sessionQuery') {
      return {
        listSessions: async () => [{ header }],
        readSession: async () => { throw new Error('delta cache should avoid re-reading the log') },
      }
    }
    if (name === 'sessionPersistence') return { list: async () => [] }
    return undefined
  },
  webServer: { register(entry) { handlerAgain = entry.handler } },
}
applyAgain(replay)
const req = {
  method: 'POST',
  headers: {},
  socket: { remoteAddress: '127.0.0.1' },
  async *[Symbol.asyncIterator]() {
    yield Buffer.from(JSON.stringify({ action: 'search', query: 'needle', options: {}, filters: {} }))
  },
}
let text = ''
const res = { setHeader() {}, end(value) { text = value } }
await handlerAgain(req, res)
const body = JSON.parse(text)
console.log(JSON.stringify({ ok: body.ok, hits: body.value.totalHits, deltaCount }))
