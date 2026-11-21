import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseSession } from '../index.js'

test('large session parsing yields to the event loop', async () => {
  const now = Date.now()
  const events = [{ type: 'session', seq: 0, time: now, data: { id: 'big', createdAt: now, cwd: '/work/big' } }]
  for (let index = 1; index <= 80_000; index += 1) {
    events.push({
      type: index % 2 === 0 ? 'assistant/message' : 'user/message',
      seq: index,
      time: now + index,
      data: {
        turn: Math.ceil(index / 20),
        step: 1,
        message: { role: index % 2 === 0 ? 'assistant' : 'user', content: [{ type: 'text', text: `message ${index} without path tokens` }] },
        content: [{ type: 'text', text: `message ${index} without path tokens` }],
      },
    })
  }
  let last = Date.now()
  let maxGap = 0
  const timer = setInterval(() => {
    const nowMs = Date.now()
    maxGap = Math.max(maxGap, nowMs - last)
    last = nowMs
  }, 5)
  try {
    await parseSession('big', { cwd: '/work/big', createdAt: now }, events, 'rev', true)
  } finally {
    clearInterval(timer)
  }
  assert.ok(maxGap < 80, `event loop stalled for ${maxGap}ms`)
})
