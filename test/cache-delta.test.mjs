import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { test } from 'node:test'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))

test('delta cache appends and reloads', async () => {
  const { stdout } = await run(process.execPath, [path.join(here, 'fixtures', 'delta-cache-child.mjs')], {
    env: { ...process.env, DSH_SEARCH_TTL_MS: '0' },
    timeout: 30_000,
  })
  const result = JSON.parse(stdout.trim())
  assert.equal(result.ok, true)
  assert.equal(result.hits, 2)
  assert.ok(result.deltaCount >= 1)
})
