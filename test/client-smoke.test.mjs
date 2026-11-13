import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'

const source = fs.readFileSync(path.join(import.meta.dirname, '..', 'client.js'), 'utf8')

function makeStyle() {
  return { dataset: {}, textContent: '', style: {}, appendChild() {}, remove() {} }
}

const React = {
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children }
  },
  useState(value) {
    return [value, () => undefined]
  },
  useMemo(factory) {
    return factory()
  },
  useCallback(callback) {
    return callback
  },
  useRef(value) {
    return { current: value }
  },
  useEffect() {},
}
React.default = React

const document = {
  documentElement: { lang: 'zh-CN' },
  head: { appendChild() {} },
  body: { appendChild() {}, removeChild() {} },
  createElement: makeStyle,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  createTreeWalker: () => ({ nextNode: () => null }),
}
document.documentElement.lang = 'zh-CN'

const localStorage = {
  value: null,
  getItem() {
    return this.value
  },
  setItem(_key, value) {
    this.value = value
  },
}

const navigator = { platform: 'MacIntel', language: 'zh-CN', userAgent: 'node' }
const window = {
  __ModuleLoader__: {
    load(definition) {
      window.__definition = definition
    },
  },
  addEventListener() {},
  removeEventListener() {},
  localStorage,
}

const context = {
  window,
  document,
  navigator,
  localStorage,
  console,
  Intl,
  URL,
  fetch: async () => ({ ok: false, status: 500, json: async () => null }),
  CSS: {},
  Highlight: class {},
  NodeFilter: { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_SKIP: 2 },
  requestAnimationFrame: (callback) => callback(),
  cancelAnimationFrame() {},
  getSelection: () => null,
  globalThis: undefined,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
}
context.globalThis = context

vm.runInNewContext(source, context, { filename: 'client.js' })

const definition = window.__definition
assert.ok(definition, 'client module registered')
assert.equal(definition.id, 'dsh-deep-search')

let mainComponent
let sidebarEntry
const slots = {
  inject(_name, factory) {
    factory()
  },
  register(entry, component) {
    if (entry.name === 'main') mainComponent = component
    if (entry.name === 'sidebar.panellist') sidebarEntry = entry
    return () => undefined
  },
}
const plugin = definition.factory((request) => {
  if (request === 'react') return React
  throw new Error(`unexpected require: ${request}`)
})

const ctx = {
  effect(factory) {
    const dispose = factory()
    if (typeof dispose === 'function') dispose()
    return () => undefined
  },
  locale: {
    register() {},
    bind() {
      return (key) => key
    },
  },
  slots,
  get(name) {
    if (name === 'layout') return { selectPanel() {} }
    return undefined
  },
}

plugin.apply(ctx)
assert.ok(mainComponent, 'main panel registered')
assert.ok(sidebarEntry, 'sidebar entry registered')
assert.equal(sidebarEntry.order, -1)

/* The empty page must render without a runtime error. */
const pageTree = mainComponent({ t: (key) => key, ctx })
assert.ok(pageTree, 'page rendered')

const t = (key) => key
const hit = {
  id: 'session#1',
  kind: 'tool',
  role: 'assistant',
  turn: 269,
  time: Date.now(),
  matches: 2,
  call: 'call_1',
  ext: '',
  files: [],
  snippet: { text: '…play_media(...)', ranges: [[2, 12]] },
}
const group = { id: 'session', title: 'demo', cwd: '/work', updatedAt: Date.now() }

assert.equal(plugin.__test.locationOf(hit), 'execute')
assert.equal(plugin.__test.locationOf({ ...hit, kind: 'message', role: 'user', call: '' }), 'ask')
assert.equal(plugin.__test.locationOf({ ...hit, kind: 'message', role: 'assistant', call: '' }), 'answer')
assert.equal(plugin.__test.locationOf({ ...hit, kind: 'reasoning', role: 'assistant' }), 'thought')
assert.equal(plugin.__test.contentLabelOf(hit, t), 'toolCall')
assert.equal(plugin.__test.contentLabelOf({ ...hit, kind: 'file', ext: 'md' }, t), '.md')

let opened = 0
let selected = 0
const row = plugin.__test.HitRow({
  hit,
  group,
  selected: false,
  isZh: true,
  t,
  onSelect() {
    selected += 1
  },
  onOpen() {
    opened += 1
  },
})
assert.ok(row, 'hit row rendered')
const openButton = row.children.find((child) => child?.props?.className === 'dsss-hit-open')
assert.ok(openButton, 'row exposes an open button')
openButton.props.onClick({ stopPropagation() {} })
assert.equal(opened, 1)
row.props.onKeyDown({ key: 'Enter', preventDefault() {}, stopPropagation() {} })
assert.equal(selected, 1)
assert.equal(opened, 1, 'Enter selects instead of jumping')

const preview = plugin.__test.Preview({
  t,
  isZh: true,
  hit,
  group,
  detail: { text: 'play_media({...})' },
  query: 'play_media',
  mode: 'word',
  filters: { caseSensitive: false, wholeWord: false },
  textRef: { current: null },
  onOpen() {},
  onCopy() {},
})
assert.ok(preview, 'preview rendered')
