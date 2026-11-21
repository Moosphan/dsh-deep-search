window.__ModuleLoader__.load({
  id: 'dsh-deep-search',
  factory(require) {
    'use strict'

    const ReactNS = require('react')
    const React = ReactNS && ReactNS.createElement !== undefined ? ReactNS : ReactNS.default
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const NS = 'sessionSearch'
    const PANEL_ID = 'deep-search'
    const ROUTE = 'deep-search/api'
    const STORE = 'dsh-deep-search.v1'
    const HIGHLIGHT = 'dsh-deep-search-arrival'
    const BUILD = 'v1.4.1'
    const DEFAULT_KINDS = ['m', 'f', 't', 'o', 'a', 's']
    const ALL_EXTS = []

    const zh = {
      panel: '深海搜索',
      title: '深海搜索',
      subtitle: '全量索引每一段会话，精确命中每一处上下文。',
      placeholder: '输入关键词，或切到正则…',
      keyword: '关键词',
      regex: '正则',
      clear: '清空',
      position: '位置',
      any: '全部',
      me: '我',
      ai: 'AI',
      time: '时间',
      all: '全部',
      today: '今天',
      d7: '近 7 天',
      d30: '近 30 天',
      d90: '近 90 天',
      custom: '自定义',
      from: '从',
      to: '到',
      content: '内容',
      message: '正文',
      file: '文件',
      tool: '工具',
      ask: '提问',
      answer: '回答',
      execute: '执行',
      thought: '思考',
      meta: '标题',
      body: '正文',
      titleKind: '标题',
      toolCall: '工具调用',
      toolOutput: '工具输出',
      reasoningBody: '推理',
      sessionLabel: '会话',
      reasoning: '思考',
      attachment: '附件',
      summary: '摘要',
      files: '文件类型',
      doc: '文档',
      code: '代码',
      data: '数据',
      image: '图片',
      media: '音视频',
      config: '配置',
      other: '其他',
      ext: '扩展名',
      workspace: '工作空间',
      sort: '排序',
      relevance: '相关',
      newest: '最新',
      oldest: '最早',
      more: '更多',
      caseSensitive: '区分大小写',
      wholeWord: '全词匹配',
      includeTitle: '匹配会话标题',
      includeReasoning: '包含思考过程',
      reset: '重置筛选',
      recent: '最近检索',
      examples: '试试这些',
      emptyTitle: '搜遍所有会话',
      emptyHint: '关键词、正则、文件名、工具输出都在索引里；不用先打开会话。',
      building: '正在建立索引',
      buildingHint: '首次会读一遍历史日志，之后只增量更新。可以先输入，结果会随索引补全。',
      sessions: '会话',
      segments: '段落',
      indexed: '索引',
      buildTime: '构建',
      open: '打开会话',
      openHint: '双击或点 → 打开',
      copy: '复制',
      copied: '已复制',
      noResults: '没有命中',
      noResultsHint: '换个关键词、关掉筛选，或试试正则。',
      loading: '检索中…',
      error: '检索失败',
      truncated: '结果已截断',
      truncatedHint: '范围太大，先缩小时间或工作空间会更快。',
      turn: '第 {n} 轮',
      matchCount: '{n} 处',
      titleMatch: '标题命中',
      current: '当前',
      allSpaces: '全部空间',
      spacesChosen: '已选 {n} 个',
      clearSpaces: '清空',
      chooseSpaces: '选择工作空间',
      filterHintFiles: '选了文件类型后只匹配文件路径命中。',
      activeFilters: '{n} 个筛选',
      search: '检索',
      ready: '就绪',
      buildingShort: '索引中',
      errorShort: '索引异常',
      footerKeys: '↑↓ 选择 · 双击 / → 打开 · Esc 返回',
      matchAt: '命中位置',
      inSession: '所在会话',
      path: '路径',
      copyPath: '复制路径',
      fileTypes: '文件',
      noTitle: '未命名会话',
      indexingCount: '已索引 {done} / {total}',
      progress: '进度',
      showAll: '显示全部',
      collapse: '收起',
      regexHint: '支持 JS 正则；线性执行，危险写法会被拦下。',
      regexInvalid: '正则无效',
      emptyKinds: '至少保留一种内容',
      totalHits: '{n} 处命中',
      hits: '处命中',
      copyText: '复制原文',
      clearQuery: '清空检索词',
      openResult: '打开这条命中',
      selected: '已选',
      live: '进行中',
      todayShort: '今天',
      yesterday: '昨天',
      retry: '重试',
      rebuild: '重建索引',
      indexError: '索引构建失败，仍可检索已索引的部分。',
    }

    const en = {
      panel: 'dsh-deep-search',
      title: 'dsh-deep-search',
      subtitle: 'Index every session. Resolve every hit.',
      placeholder: 'Type a keyword, or switch to regex…',
      keyword: 'Keyword',
      regex: 'Regex',
      clear: 'Clear',
      position: 'Speaker',
      any: 'Any',
      me: 'Me',
      ai: 'AI',
      time: 'Time',
      all: 'All',
      today: 'Today',
      d7: '7 days',
      d30: '30 days',
      d90: '90 days',
      custom: 'Custom',
      from: 'From',
      to: 'To',
      content: 'Content',
      message: 'Messages',
      file: 'Files',
      tool: 'Tools',
      ask: 'Asked',
      answer: 'Answered',
      execute: 'Executed',
      thought: 'Reasoning',
      meta: 'Title',
      body: 'Message',
      titleKind: 'Title',
      toolCall: 'Tool call',
      toolOutput: 'Tool output',
      reasoningBody: 'Reasoning',
      sessionLabel: 'Session',
      reasoning: 'Reasoning',
      attachment: 'Attachments',
      summary: 'Summaries',
      files: 'File type',
      doc: 'Docs',
      code: 'Code',
      data: 'Data',
      image: 'Images',
      media: 'Media',
      config: 'Config',
      other: 'Other',
      ext: 'Extension',
      workspace: 'Workspace',
      sort: 'Sort',
      relevance: 'Relevance',
      newest: 'Newest',
      oldest: 'Oldest',
      more: 'More',
      caseSensitive: 'Match case',
      wholeWord: 'Whole word',
      includeTitle: 'Match session titles',
      includeReasoning: 'Include reasoning',
      reset: 'Reset filters',
      recent: 'Recent searches',
      examples: 'Try one',
      emptyTitle: 'Search every session',
      emptyHint: 'Keywords, regex, file names, and tool output are indexed. No need to open a session first.',
      building: 'Building the index',
      buildingHint: 'The first pass reads stored logs; later runs update incrementally. Type now — results fill in as it goes.',
      sessions: 'Sessions',
      segments: 'Segments',
      indexed: 'Indexed',
      buildTime: 'Build',
      open: 'Open session',
      openHint: 'Double-click or use → to open',
      copy: 'Copy',
      copied: 'Copied',
      noResults: 'No matches',
      noResultsHint: 'Try another keyword, clear a filter, or use a regex.',
      loading: 'Searching…',
      error: 'Search failed',
      truncated: 'Results truncated',
      truncatedHint: 'Narrow the time range or workspace for a complete pass.',
      turn: 'Turn {n}',
      matchCount: '{n} hits',
      titleMatch: 'Title match',
      current: 'Current',
      allSpaces: 'All workspaces',
      spacesChosen: '{n} selected',
      clearSpaces: 'Clear',
      chooseSpaces: 'Choose workspaces',
      filterHintFiles: 'With a file type selected, only file paths match.',
      activeFilters: '{n} filters',
      search: 'Search',
      ready: 'Ready',
      buildingShort: 'Indexing',
      errorShort: 'Index error',
      footerKeys: '↑↓ select · double-click / → open · Esc back',
      matchAt: 'Matched in',
      inSession: 'Session',
      path: 'Path',
      copyPath: 'Copy path',
      fileTypes: 'Files',
      noTitle: 'Untitled session',
      indexingCount: 'Indexed {done} / {total}',
      progress: 'Progress',
      showAll: 'Show all',
      collapse: 'Collapse',
      regexHint: 'JavaScript regex. Dangerous patterns are rejected before they can backtrack.',
      regexInvalid: 'Invalid pattern',
      emptyKinds: 'Keep at least one content kind',
      totalHits: '{n} hits',
      hits: 'hits',
      copyText: 'Copy text',
      clearQuery: 'Clear query',
      openResult: 'Open this match',
      selected: 'Selected',
      live: 'Live',
      todayShort: 'today',
      yesterday: 'yesterday',
      retry: 'Retry',
      rebuild: 'Rebuild index',
      indexError: 'Index build failed; indexed parts remain searchable.',
    }

    const DICT = { zh, en }

    // #region helpers ---------------------------------------------------------

    function isMac() {
      try {
        return /Mac|iPhone|iPad/.test(navigator.platform) || /Mac OS/.test(navigator.userAgent)
      } catch {
        return true
      }
    }

    function tOf(t, key, vars) {
      let text = t(key)
      if (text === key) text = en[key] ?? key
      if (vars !== undefined) {
        for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
      }
      return text
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function pad(value) {
      return String(value).padStart(2, '0')
    }

    function dayStart(value) {
      const date = value instanceof Date ? value : new Date(value)
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    }

    function parseDay(text) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text))
      if (match === null) return null
      const time = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime()
      return Number.isNaN(time) ? null : time
    }

    function dayString(time) {
      const date = new Date(time)
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    function formatTime(time, isZh) {
      if (typeof time !== 'number' || time <= 0) return '—'
      const date = new Date(time)
      const now = new Date()
      const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
      if (sameDay) return `${pad(date.getHours())}:${pad(date.getMinutes())}`
      if (date.getFullYear() === now.getFullYear()) return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    function shortPath(cwd) {
      if (typeof cwd !== 'string' || cwd === '') return '—'
      let text = cwd
      try {
        const home = globalThis.__DSH_HOME_DIR__ ?? ''
        if (home !== '' && text.startsWith(home)) text = `~${text.slice(home.length)}`
      } catch {
        /* ignore */
      }
      const parts = text.split(/[\\/]/).filter(Boolean)
      if (parts.length <= 2) return text
      return `…/${parts.slice(-2).join('/')}`
    }

    function baseName(cwd) {
      if (typeof cwd !== 'string' || cwd === '') return '—'
      const parts = cwd.split(/[\\/]/).filter(Boolean)
      return parts.length === 0 ? cwd : parts[parts.length - 1]
    }

    function formatNumber(value, locale) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '0'
      return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'zh-CN').format(Math.round(number))
    }

    function formatBytes(bytes) {
      const number = Number(bytes)
      if (!Number.isFinite(number) || number <= 0) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      let index = 0
      let value = number
      while (value >= 1024 && index < units.length - 1) {
        value /= 1024
        index += 1
      }
      return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
    }

    function escapeRegExp(text) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function findRanges(text, query, options) {
      if (typeof text !== 'string' || text === '' || typeof query !== 'string' || query === '') return []
      const out = []
      try {
        if (options.regex === true) {
          const regex = new RegExp(query, `g${options.caseSensitive ? '' : 'i'}u`)
          let match
          while ((match = regex.exec(text)) !== null && out.length < 300) {
            if (match[0].length === 0) {
              regex.lastIndex += 1
              if (regex.lastIndex > text.length) break
              continue
            }
            out.push([match.index, match.index + match[0].length])
          }
          return out
        }
        if (options.caseSensitive === true) {
          let from = 0
          while (out.length < 300) {
            const index = text.indexOf(query, from)
            if (index < 0) break
            out.push([index, index + query.length])
            from = index + Math.max(1, query.length)
          }
          return out
        }
        const regex = new RegExp(escapeRegExp(query), 'giu')
        let match
        while ((match = regex.exec(text)) !== null && out.length < 300) {
          out.push([match.index, match.index + match[0].length])
        }
      } catch {
        return []
      }
      return out
    }

    function Marked(props) {
      const { text, ranges } = props
      if (!Array.isArray(ranges) || ranges.length === 0) return h('span', null, text)
      const parts = []
      let position = 0
      let key = 0
      for (const range of ranges) {
        const start = clamp(range[0], 0, text.length)
        const end = clamp(range[1], start, text.length)
        if (start < position || end === start) continue
        if (start > position) parts.push(text.slice(position, start))
        parts.push(h('mark', { key: `m${key}`, className: 'dsss-mark' }, text.slice(start, end)))
        key += 1
        position = end
      }
      if (position < text.length) parts.push(text.slice(position))
      return h('span', null, ...parts)
    }

    function readPrefs() {
      try {
        let raw = globalThis.localStorage?.getItem(STORE)
        /* Read the pre-2.0 key once so an existing panel keeps its last position. */
        if (raw === null || raw === undefined) raw = globalThis.localStorage?.getItem('dsh-deep-search.v1')
        if (raw === null || raw === undefined) return null
        const value = JSON.parse(raw)
        return value !== null && typeof value === 'object' ? value : null
      } catch {
        return null
      }
    }

    function writePrefs(value) {
      try {
        globalThis.localStorage?.setItem(STORE, JSON.stringify(value))
      } catch {
        /* a private window can refuse storage */
      }
    }

    function toast(text) {
      try {
        const node = document.createElement('div')
        node.textContent = text
        node.style.cssText =
          'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:2147483000;' +
          'padding:8px 14px;border-radius:8px;font:500 12px/18px var(--dsw-font-family);' +
          'color:var(--dsw-alias-label-primary-foreground);background:var(--dsw-alias-button-contrast-fill);' +
          'box-shadow:var(--dsw-shadow-lv2);pointer-events:none;opacity:0;transition:opacity .16s ease'
        document.body.appendChild(node)
        requestAnimationFrame(() => {
          node.style.opacity = '1'
        })
        setTimeout(() => {
          node.style.opacity = '0'
          setTimeout(() => node.remove(), 200)
        }, 1400)
      } catch {
        /* no DOM */
      }
    }

    // #endregion

    // #region icons -----------------------------------------------------------

    function IconSearch(props) {
      const size = props.size ?? 16
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('circle', { cx: 10.5, cy: 10.5, r: 6.4, stroke: 'currentColor', strokeWidth: props.weight ?? 1.8 }),
        h('path', { d: 'm15.4 15.4 5.2 5.2', stroke: 'currentColor', strokeWidth: props.weight ?? 1.8, strokeLinecap: 'round' }),
        props.lines === false
          ? null
          : h('path', { d: 'M7.7 8.7h5.6M7.7 11.3h3.4', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.55 }),
      )
    }

    function IconSession(props) {
      const size = props.size ?? 14
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M4.5 7A3.5 3.5 0 0 1 8 3.5h8A3.5 3.5 0 0 1 19.5 7v6a3.5 3.5 0 0 1-3.5 3.5H9.2L5 20v-3.8A3.5 3.5 0 0 1 4.5 12V7Z',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinejoin: 'round',
        }),
        h('path', { d: 'M8.2 8.2h7.6M8.2 11.2h4.8', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', opacity: 0.7 }),
      )
    }

    function IconChevron() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'm7 10 5 5 5-5', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconClose() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M6 6l12 12M18 6 6 18', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }),
      )
    }

    function IconArrow() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M5 12h13m-5-5 5 5-5 5', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconCopy() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2.4, stroke: 'currentColor', strokeWidth: 1.7 }),
        h('path', { d: 'M15 5.5A2.5 2.5 0 0 0 12.5 3H6a3 3 0 0 0-3 3v6.5A2.5 2.5 0 0 0 5.5 15', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconRefresh() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M20 12a8 8 0 1 1-2.5-5.8M20 4v4.5h-4.5', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    // #endregion

    // #region popover ---------------------------------------------------------

    function Popover(props) {
      const { open, onClose, children, align, width } = props
      const ref = useRef(null)
      useEffect(() => {
        if (!open) return undefined
        const onPointer = (event) => {
          if (ref.current !== null && !ref.current.contains(event.target)) onClose()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }
        document.addEventListener('pointerdown', onPointer, true)
        document.addEventListener('keydown', onKey, true)
        return () => {
          document.removeEventListener('pointerdown', onPointer, true)
          document.removeEventListener('keydown', onKey, true)
        }
      }, [open, onClose])
      if (!open) return null
      const style = { width: width ?? 260 }
      if (align === 'right') style.right = 0
      else style.left = 0
      return h(
        'div',
        { ref, className: 'dsss-menu', style, role: 'dialog' },
        h('div', { className: 'dsss-menu-inner' }, children),
      )
    }

    function Chip(props) {
      const { label, active, onClick, open, children, wide } = props
      return h(
        'div',
        { className: `dsss-chipwrap${wide ? ' dsss-chipwrap-wide' : ''}` },
        h(
          'button',
          {
            type: 'button',
            className: `dsss-chip${active ? ' is-on' : ''}${open ? ' is-open' : ''}`,
            onClick,
            'aria-expanded': open === true,
          },
          h('span', { className: 'dsss-chip-label' }, label),
          h('span', { className: 'dsss-chip-chevron' }, h(IconChevron)),
        ),
        children,
      )
    }

    function Toggle(props) {
      const { on, onChange, label, hint } = props
      return h(
        'button',
        {
          type: 'button',
          className: 'dsss-toggle-row',
          onClick: () => onChange(!on),
          role: 'switch',
          'aria-checked': on === true,
        },
        h(
          'span',
          { className: 'dsss-toggle-copy' },
          h('span', { className: 'dsss-toggle-label' }, label),
          hint === undefined ? null : h('span', { className: 'dsss-toggle-hint' }, hint),
        ),
        h('span', { className: `dsss-switch${on ? ' is-on' : ''}` }, h('span', { className: 'dsss-switch-dot' })),
      )
    }

    function Segmented(props) {
      const { value, options, onChange, compact } = props
      return h(
        'div',
        { className: `dsss-seg${compact ? ' is-compact' : ''}`, role: 'tablist' },
        options.map((option) =>
          h(
            'button',
            {
              key: option.value,
              type: 'button',
              role: 'tab',
              'aria-selected': value === option.value,
              className: `dsss-seg-btn${value === option.value ? ' is-on' : ''}`,
              onClick: () => onChange(option.value),
            },
            option.label,
          ),
        ),
      )
    }

    // #endregion

    // #region page ------------------------------------------------------------

    const RANGE_PRESETS = [
      { value: 'all', key: 'all' },
      { value: 'today', key: 'today' },
      { value: '7', key: 'd7' },
      { value: '30', key: 'd30' },
      { value: '90', key: 'd90' },
      { value: 'custom', key: 'custom' },
    ]

    const KIND_OPTIONS = [
      { value: 'm', key: 'message' },
      { value: 'f', key: 'file' },
      { value: 't', key: 'toolCall' },
      { value: 'o', key: 'toolOutput' },
      { value: 'a', key: 'attachment' },
      { value: 's', key: 'summary' },
      { value: 'r', key: 'reasoning' },
    ]

    const FILE_KINDS = [
      { value: 'doc', key: 'doc' },
      { value: 'code', key: 'code' },
      { value: 'data', key: 'data' },
      { value: 'config', key: 'config' },
      { value: 'image', key: 'image' },
      { value: 'media', key: 'media' },
      { value: 'other', key: 'other' },
    ]

    function defaultsFromPrefs() {
      const prefs = readPrefs()
      const filters = {
        position: 'any',
        range: 'all',
        from: '',
        to: '',
        kinds: DEFAULT_KINDS.slice(),
        fileKinds: [],
        exts: [],
        workspaces: [],
        sort: 'newest',
        caseSensitive: false,
        wholeWord: false,
        includeTitle: true,
      }
      if (prefs !== null && prefs.filters !== null && typeof prefs.filters === 'object') {
        for (const key of Object.keys(filters)) {
          if (prefs.filters[key] !== undefined) filters[key] = prefs.filters[key]
        }
        /* The pre-1.3 default was relevance; migrate it once so results start with
           the newest sessions and hits, as requested. */
        if (prefs.sortVersion !== 2 && filters.sort === 'relevance') filters.sort = 'newest'
      }
      return {
        mode: prefs?.mode === 'regex' ? 'regex' : 'word',
        filters: sanitizeFilters(filters),
        query: typeof prefs?.query === 'string' ? prefs.query : '',
        recent: Array.isArray(prefs?.recent) ? prefs.recent.filter((item) => typeof item === 'string').slice(0, 6) : [],
        selected: typeof prefs?.selected === 'string' ? prefs.selected : '',
        scroll: Number.isFinite(prefs?.scroll) ? Number(prefs.scroll) : 0,
      }
    }

    function sanitizeFilters(input) {
      const filters = { ...input }
      filters.position = ['any', 'user', 'assistant'].includes(filters.position) ? filters.position : 'any'
      filters.range = ['all', 'today', '7', '30', '90', 'custom'].includes(filters.range) ? filters.range : 'all'
      filters.kinds = Array.isArray(filters.kinds)
        ? filters.kinds.filter((kind) => ['m', 'f', 't', 'o', 'a', 's', 'r'].includes(kind))
        : DEFAULT_KINDS.slice()
      if (filters.kinds.length === 0) filters.kinds = DEFAULT_KINDS.slice()
      filters.fileKinds = Array.isArray(filters.fileKinds) ? filters.fileKinds.filter((kind) => FILE_KINDS.some((item) => item.value === kind)) : []
      filters.exts = Array.isArray(filters.exts) ? filters.exts.filter((ext) => typeof ext === 'string').slice(0, 40) : []
      filters.workspaces = Array.isArray(filters.workspaces) ? filters.workspaces.filter((cwd) => typeof cwd === 'string') : []
      filters.sort = ['relevance', 'newest', 'oldest'].includes(filters.sort) ? filters.sort : 'newest'
      filters.from = typeof filters.from === 'string' ? filters.from : ''
      filters.to = typeof filters.to === 'string' ? filters.to : ''
      return filters
    }

    function rangeBounds(filters) {
      const now = new Date()
      const startOfToday = dayStart(now)
      if (filters.range === 'all') return { since: null, until: null }
      if (filters.range === 'today') return { since: startOfToday, until: startOfToday + 86_400_000 - 1 }
      if (filters.range === 'custom') {
        const since = parseDay(filters.from)
        const until = parseDay(filters.to)
        return {
          since,
          until: until === null ? null : until + 86_400_000 - 1,
        }
      }
      const days = Number(filters.range)
      if (!Number.isFinite(days) || days <= 0) return { since: null, until: null }
      return { since: startOfToday - (days - 1) * 86_400_000, until: null }
    }

    function buildFilters(filters) {
      const bounds = rangeBounds(filters)
      return {
        position: filters.position,
        kinds: filters.kinds,
        fileKinds: filters.fileKinds,
        exts: filters.exts,
        workspaces: filters.workspaces,
        sort: filters.sort,
        includeTitle: filters.includeTitle,
        since: bounds.since,
        until: bounds.until,
      }
    }

    async function post(body, signal) {
      const response = await fetch(ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
        signal,
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || payload === null || payload.ok !== true) {
        const message =
          payload !== null && payload.error !== null && typeof payload.error === 'object' && typeof payload.error.message === 'string'
            ? payload.error.message
            : `HTTP ${response.status}`
        throw new Error(message)
      }
      return payload.value
    }

    /**
     * Stream one search as NDJSON batches. Falls back to the plain JSON reply when
     * the Host does not stream (older plugin generation).
     */
    async function streamSearch(body, signal, onValue) {
      const response = await fetch(ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...body, stream: true }),
        signal,
      })
      const type = response.headers.get('content-type') ?? ''
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          payload !== null && payload.error !== null && typeof payload.error === 'object' && typeof payload.error.message === 'string'
            ? payload.error.message
            : `HTTP ${response.status}`
        throw new Error(message)
      }
      if (!type.includes('application/x-ndjson') || response.body === null) {
        const payload = await response.json().catch(() => null)
        if (payload === null || payload.ok !== true) throw new Error('检索返回格式异常')
        onValue(payload.value)
        return payload.value
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let current = null
      const handle = (line) => {
        if (line === '') return
        let message
        try {
          message = JSON.parse(line)
        } catch {
          return
        }
        if (message.type === 'meta') {
          current = { ...message.value, groups: [] }
          onValue({ ...current, groups: [] })
        } else if (message.type === 'groups' && current !== null) {
          current = { ...current, groups: [...current.groups, ...message.groups] }
          onValue(current)
        } else if (message.type === 'done' && current !== null) {
          current = { ...current, ...message.value }
          onValue(current)
        } else if (message.type === 'error') {
          throw new Error(message.message ?? 'stream failed')
        }
      }
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let index = buffer.indexOf('\n')
        while (index >= 0) {
          const line = buffer.slice(0, index).trim()
          buffer = buffer.slice(index + 1)
          handle(line)
          index = buffer.indexOf('\n')
        }
      }
      if (buffer.trim() !== '') handle(buffer.trim())
      return current
    }

    function openTarget(ctx, sessionId, hit) {
      let target
      try {
        target = ctx.get('uiWorkspace')
      } catch {
        target = undefined
      }
      const jump = {
        sessionId,
        anchor: typeof hit?.anchor === 'string' ? hit.anchor : '',
        query: typeof hit?.query === 'string' ? hit.query : '',
        turn: Number.isSafeInteger(hit?.turn) ? hit.turn : 0,
        seq: Number.isSafeInteger(hit?.seq) ? hit.seq : 0,
        call: typeof hit?.call === 'string' ? hit.call : '',
        kind: typeof hit?.kind === 'string' ? hit.kind : '',
      }
      try {
        if (target !== undefined && typeof target.openSession === 'function') target.openSession(sessionId)
      } catch (error) {
        console.warn('[deep-search] openSession failed', error)
      }
      try {
        const layout = ctx.get('layout')
        if (layout !== undefined && layout !== null && typeof layout.selectPanel === 'function') layout.selectPanel(null)
      } catch {
        /* ignore */
      }
      if (jump.kind !== 'title' && (jump.turn > 0 || jump.call !== '' || jump.anchor !== '')) scheduleHighlight(jump, ctx, sessionId)
    }

    function scheduleHighlight(jump, ctx, sessionId) {
      const needles = []
      for (const value of [jump.anchor, jump.query]) {
        const text = typeof value === 'string' ? value.trim() : ''
        if (text.length >= 2 && !needles.includes(text)) needles.push(text)
        if (text.length > 24) {
          const short = text.slice(0, 24)
          if (!needles.includes(short)) needles.push(short)
        }
      }
      const turn = Number.isSafeInteger(jump.turn) ? jump.turn : 0
      const seq = Number.isSafeInteger(jump.seq) ? jump.seq : 0
      const call = typeof jump.call === 'string' ? jump.call : ''
      if (needles.length === 0 && turn === 0 && call === '' && seq === 0) return
      let started = Date.now()
      let loads = 0
      let lastLoad = 0
      let loadingOlder = false
      let expansions = 0

      const attempt = () => {
        const flow = document.querySelector('[data-chat-flow]')
        if (flow !== null) {
          /* 1. An exact tool-call row is the most precise target we have. */
          if (call !== '') {
            const callElement = flow.querySelector('[data-chat-call-id="' + cssEscape(call) + '"]')
            if (callElement !== null) {
              if (revealElement(callElement)) return
              if (expansions < 4) {
                expansions += 1
                setTimeout(attempt, 240)
                return
              }
            }
          }

          /* 2. The Turn row: scroll the right turn, then find the exact text. */
          if (turn > 0) {
            const rows = [...flow.querySelectorAll('[data-chat-turn="' + cssEscape(String(turn)) + '"]')]
            if (rows.length > 0) {
              /* A collapsed process group hides its tool rows; open it before measuring. */
              if (expansions < 2 && expandGroup(rows)) {
                expansions += 1
                setTimeout(attempt, 240)
                return
              }
              let visible = rows.filter(isVisible)
              if (visible.length === 0) {
                if (expandGroup(rows) && expansions < 4) {
                  expansions += 1
                  setTimeout(attempt, 240)
                  return
                }
              }
              for (const row of visible.length > 0 ? visible : rows) {
                for (const needle of needles) {
                  const range = findTextRange(row, needle)
                  if (range !== null && landRange(range)) return
                }
              }
              const target = visible[0] ?? rows.find(isVisible)
              if (target !== undefined) {
                target.scrollIntoView({ block: 'center', behavior: 'smooth' })
                pulse(target)
                return
              }
              if (expandGroup(rows) && expansions < 4) {
                expansions += 1
                setTimeout(attempt, 240)
                return
              }
            }
          }

          /* 3. Last resort: any matching text in the transcript. */
          for (const needle of needles) {
            const range = findTextRange(flow, needle)
            if (range !== null && landRange(range)) return
          }
        }

        if (Date.now() - started > 12000) return
        const now = Date.now()
        if (loads < 7 && now - lastLoad > 900 && !loadingOlder) {
          lastLoad = now
          loads += 1
          loadingOlder = true
          loadOlderPage(ctx, sessionId)
            .then((loaded) => {
              if (!loaded) {
                const button = findLoadEarlier()
                if (button !== null) {
                  try {
                    button.click()
                  } catch {
                    /* ignore */
                  }
                }
              }
            })
            .finally(() => {
              loadingOlder = false
            })
        }
        setTimeout(attempt, 380)
      }
      /* The Chat view's own turn rail is the authoritative navigator: its marks
         call `navigateToTurn`, which loads an unloaded turn and aligns its anchor.
         Use it first, then refine to the exact tool call inside that turn. */
      const start = async () => {
        let rail = false
        if (turn > 0) {
          for (let attempt = 0; attempt < 3 && !rail; attempt += 1) {
            rail = await jumpViaTurnRail(turn)
            if (!rail) await new Promise((resolve) => setTimeout(resolve, 260))
          }
        }
        if (!rail && seq > 0) await loadThroughWithRetry(ctx, sessionId, seq)
        started = Date.now()
        setTimeout(attempt, rail ? 650 : 320)
      }
      setTimeout(start, 320)
    }

    function turnOfMark(button) {
      const match = /(\d+)/.exec(button.getAttribute('aria-label') ?? '')
      return match === null ? NaN : Number(match[1])
    }

    /** Click the host's turn rail for one Turn, scrolling the virtual rail when needed. */
    async function jumpViaTurnRail(turn) {
      if (!(turn > 0)) return false
      const navs = document.querySelectorAll('nav[aria-label]')
      for (const nav of navs) {
        if (nav.closest('[data-sidebar-right-tab]') !== null) continue
        const label = nav.getAttribute('aria-label') ?? ''
        if (!/轮次导航|Turn navigation/i.test(label)) continue
        const readMarks = () => [...nav.querySelectorAll('button[data-index]')]
        const direct = readMarks().find((button) => turnOfMark(button) === turn)
        if (direct !== undefined) {
          direct.click()
          return true
        }
        let offset = null
        for (const button of readMarks()) {
          const value = turnOfMark(button)
          const index = Number(button.dataset.index)
          if (Number.isSafeInteger(value) && Number.isSafeInteger(index)) {
            offset = index - value
            break
          }
        }
        if (offset === null) return false
        const targetIndex = turn + offset
        let scroller = null
        for (const element of nav.querySelectorAll('div')) {
          if (element.scrollHeight > element.clientHeight + 8) {
            scroller = element
            break
          }
        }
        if (scroller === null) return false
        const findByIndex = () => readMarks().find((button) => Number(button.dataset.index) === targetIndex)
        const positions = [targetIndex * 10, Math.max(0, targetIndex * 10 - 40), targetIndex * 10 + 40]
        for (const position of positions) {
          scroller.scrollTop = position
          scroller.dispatchEvent(new Event('scroll', { bubbles: true }))
          for (let wait = 0; wait < 4; wait += 1) {
            await new Promise((resolve) => setTimeout(resolve, 80))
            const mark = findByIndex()
            if (mark !== undefined) {
              mark.click()
              return true
            }
          }
        }
        /* Last resort: sweep the rail so the virtualizer mounts the target row. */
        const step = Math.max(24, Math.floor(scroller.clientHeight / 2))
        for (let position = 0; position <= scroller.scrollHeight; position += step) {
          scroller.scrollTop = position
          scroller.dispatchEvent(new Event('scroll', { bubbles: true }))
          await new Promise((resolve) => setTimeout(resolve, 45))
          const mark = findByIndex()
          if (mark !== undefined) {
            mark.click()
            return true
          }
        }
        return false
      }
      return false
    }

    async function loadThroughWithRetry(ctx, sessionId, seq) {
      /* The Session binding is created as the Conversation opens; retry briefly
         instead of falling straight back to visible "load older" buttons. */
      for (let attempt = 0; attempt < 6; attempt += 1) {
        if (await loadThroughPage(ctx, sessionId, seq)) return true
        await new Promise((resolve) => setTimeout(resolve, 280))
      }
      return false
    }

    async function loadThroughPage(ctx, sessionId, seq) {
      try {
        const sessions = ctx.get('sessions')
        if (sessions === undefined || sessions === null || typeof sessions.binding !== 'function') return false
        const binding = sessions.binding(sessionId)
        const session = binding?.session
        if (session !== undefined && session !== null && typeof session.loadThrough === 'function') {
          await session.loadThrough(seq)
          return true
        }
      } catch {
        /* fall back to the visible load control */
      }
      return false
    }

    /** Whether an element is actually painted (a collapsed process row is not). */
    function isVisible(element) {
      if (element === null || element === undefined) return false
      if (typeof element.getClientRects !== 'function') return false
      if (element.getClientRects().length === 0) return false
      return element.closest('[hidden]') === null
    }

    /** Briefly outline a row without touching its persisted classes. */
    function pulse(element) {
      try {
        element.animate(
          [
            { boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--dsw-static-deepseek-450, #5686fe) 70%, transparent)' },
            { boxShadow: 'inset 0 0 0 2px transparent' },
          ],
          { duration: 2200, easing: 'ease-out' },
        )
      } catch {
        /* older engines simply skip the outline */
      }
    }

    /** Expand the nearest collapsed process group when a target sits inside it. */
    function expandGroup(rows) {
      for (const row of rows) {
        const own = row.querySelector('button[aria-expanded="false"]')
        if (own !== null) {
          own.click()
          return true
        }
        const group = row.closest('[data-chat-group-key]')
        const toggle = group?.querySelector('button[aria-expanded="false"]')
        if (toggle !== null && toggle !== undefined) {
          toggle.click()
          return true
        }
      }
      return false
    }

    /** Scroll to a call/row, expanding a collapsed process group when needed. */
    function revealElement(element) {
      if (!isVisible(element)) {
        const group = element.closest('[data-chat-group-key]') ?? element.closest('[data-chat-turn]')
        const toggle = group?.querySelector('button[aria-expanded="false"]')
        if (toggle !== null && toggle !== undefined) {
          toggle.click()
          return false
        }
        const turn = element.closest('[data-chat-turn]')
        const fallback = turn?.querySelector('button[aria-expanded="false"]')
        if (fallback !== null && fallback !== undefined) {
          fallback.click()
          return false
        }
      }
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      pulse(element)
      return true
    }

    /** Paint a text range with the native highlight API and scroll it into view. */
    function landRange(range) {
      const element = range.startContainer.parentElement
      if (element === null) return false
      if (!isVisible(element)) {
        const group = element.closest('[data-chat-group-key]') ?? element.closest('[data-chat-turn]')
        const toggle = group?.querySelector('button[aria-expanded="false"]')
        if (toggle !== null && toggle !== undefined) {
          toggle.click()
          return false
        }
      }
      try {
        if (typeof CSS !== 'undefined' && CSS !== null && CSS.highlights !== undefined && typeof Highlight !== 'undefined') {
          CSS.highlights.set(HIGHLIGHT, new Highlight(range))
          setTimeout(() => {
            try {
              CSS.highlights.delete(HIGHLIGHT)
            } catch {
              /* ignore */
            }
          }, 6200)
        } else {
          const selection = globalThis.getSelection?.()
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
        element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        pulse(element)
        return true
      } catch {
        return false
      }
    }

    async function loadOlderPage(ctx, sessionId) {
      try {
        const sessions = ctx.get('sessions')
        const scope = sessions !== undefined && sessions !== null && typeof sessions.scope === 'function' ? sessions.scope(sessionId) : undefined
        if (scope === undefined || scope === null) return false
        const conversation = typeof scope.get === 'function' ? scope.get('conversation') : scope.conversation
        if (conversation !== undefined && conversation !== null && typeof conversation.loadOlder === 'function') {
          await conversation.loadOlder()
          return true
        }
      } catch {
        /* fall back to the visible load control */
      }
      return false
    }

    function findLoadEarlier() {
      const nodes = document.querySelectorAll('button')
      for (const node of nodes) {
        if (node.closest('[data-sidebar-right-tab]') !== null) continue
        if (node.disabled === true) continue
        const text = (node.textContent ?? '').trim()
        if (text.length > 24) continue
        if (/^(加载更早|加载更多|展开更早|Load earlier|Load more|Show earlier)/i.test(text)) return node
      }
      return null
    }

    function findTextRange(root, needle) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeValue !== null && node.nodeValue.includes(needle) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        },
      })
      const node = walker.nextNode()
      if (node === null) return null
      const index = node.nodeValue.indexOf(needle)
      if (index < 0) return null
      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + needle.length)
      return range
    }

    function SessionSearchPage(props) {
      const t = props.t ?? ((key) => en[key] ?? key)
      const initial = useMemo(() => defaultsFromPrefs(), [])
      const [query, setQuery] = useState(initial.query)
      const [mode, setMode] = useState(initial.mode)
      const [filters, setFilters] = useState(initial.filters)
      const [recent, setRecent] = useState(initial.recent)
      const [status, setStatus] = useState(null)
      const [data, setData] = useState(null)
      const [detail, setDetail] = useState(null)
      const [selectedId, setSelectedId] = useState(initial.selected || '')
      const [loading, setLoading] = useState(false)
      const [streaming, setStreaming] = useState(false)
      const [error, setError] = useState('')
      const [openMenu, setOpenMenu] = useState('')
      const [composing, setComposing] = useState(false)
      const [refreshNonce, setRefreshNonce] = useState(0)
      const inputRef = useRef(null)
      const rootRef = useRef(null)
      const listRef = useRef(null)
      const selectedIdRef = useRef(initial.selected || '')
      const lastBuiltAt = useRef(0)
      const lastQuery = useRef(initial.query || '')
      const scrollPos = useRef(Number(initial.scroll) || 0)
      const scrollSaveTimer = useRef(null)
      const retryTimer = useRef(null)
      const retryCount = useRef(0)
      const searchSeq = useRef(0)
      const restoreScroll = useRef(Number(initial.scroll) || 0)
      const prefsRef = useRef({})

      const isZh = /^zh/i.test(document.documentElement.lang || navigator.language || 'zh')
      const locale = isZh ? 'zh' : 'en'

      prefsRef.current = { mode, query, filters, recent }

      const save = useCallback(
        (next = {}) => {
          writePrefs({
            mode: next.mode ?? mode,
            query: next.query ?? query,
            filters: next.filters ?? filters,
            recent: next.recent ?? recent,
            selected: next.selected ?? selectedIdRef.current,
            scroll: next.scroll ?? scrollPos.current,
            sortVersion: 2,
          })
        },
        [mode, query, filters, recent],
      )

      /* Keep the reading position when the panel is left for a Session and later reopened. */
      useEffect(() => () => {
        if (scrollSaveTimer.current !== null) clearTimeout(scrollSaveTimer.current)
        if (retryTimer.current !== null) clearTimeout(retryTimer.current)
        writePrefs({
          ...prefsRef.current,
          selected: selectedIdRef.current,
          scroll: scrollPos.current,
          sortVersion: 2,
        })
      }, [])

      const selectHit = useCallback(
        (id) => {
          setSelectedId(id)
          selectedIdRef.current = id
          scrollPos.current = listRef.current?.scrollTop ?? scrollPos.current
          save({ selected: id, scroll: scrollPos.current })
        },
        [save],
      )

      const openHit = useCallback(
        (group, hit) => {
          setSelectedId(hit.id)
          selectedIdRef.current = hit.id
          scrollPos.current = listRef.current?.scrollTop ?? scrollPos.current
          save({ selected: hit.id, scroll: scrollPos.current })
          openTarget(ctxRef.current, group.id, { ...hit, query })
        },
        [save, query],
      )

      useEffect(() => {
        inputRef.current?.focus()
        const retry = setTimeout(() => inputRef.current?.focus(), 420)
        const retryLate = setTimeout(() => inputRef.current?.focus(), 1200)
        return () => {
          clearTimeout(retry)
          clearTimeout(retryLate)
        }
      }, [])

      useEffect(() => {
        let alive = true
        const load = async () => {
          try {
            const value = await post({ action: 'status' })
            if (alive) setStatus(value)
          } catch (failure) {
            if (alive) setError(failure.message)
          }
        }
        load()
        const timer = setInterval(async () => {
          try {
            const value = await post({ action: 'status' })
            if (!alive) return
            setStatus(value)
            if (!value.building && lastBuiltAt.current !== value.builtAt) {
              lastBuiltAt.current = value.builtAt
              setRefreshNonce((nonce) => nonce + 1)
            }
          } catch {
            /* transient */
          }
        }, 2500)
        return () => {
          alive = false
          clearInterval(timer)
        }
      }, [])

      const building = status?.building === true

      const search = useCallback(
        async (signal) => {
          const seq = (searchSeq.current += 1)
          const trimmed = query.trim()
          if (trimmed === '') {
            setData(null)
            setDetail(null)
            setLoading(false)
            setStreaming(false)
            setError('')
            return
          }
          setLoading(true)
          try {
            const body = {
              action: 'search',
              query: trimmed,
              options: { regex: mode === 'regex', caseSensitive: filters.caseSensitive, wholeWord: filters.wholeWord },
              filters: buildFilters(filters),
            }
            if (seq === searchSeq.current) setStreaming(true)
            let value = await streamSearch(body, signal, (partial) => {
              if (seq === searchSeq.current) setData(partial)
            })
            if (value === null) value = await post(body, signal)
            setStreaming(false)
            setData(value)
            setError('')
            retryCount.current = 0
            const flat = flatten(value)
            if (flat.length > 0) {
              const changedQuery = lastQuery.current !== query
              lastQuery.current = query
              if (changedQuery || !flat.some((item) => item.hit.id === selectedIdRef.current)) {
                setSelectedId(flat[0].hit.id)
                selectedIdRef.current = flat[0].hit.id
              }
            } else {
              setSelectedId('')
              selectedIdRef.current = ''
            }
          } catch (failure) {
            if (failure.name === 'AbortError') return
            const network = failure instanceof TypeError || /fetch|network|ECONN/i.test(String(failure.message))
            if (network && retryCount.current < 3) {
              retryCount.current += 1
              setError('连接中断，正在重试…')
              if (retryTimer.current !== null) clearTimeout(retryTimer.current)
              retryTimer.current = setTimeout(() => {
                retryTimer.current = null
                setRefreshNonce((nonce) => nonce + 1)
              }, 600 * retryCount.current)
            } else {
              setError(failure.message)
            }
          } finally {
            if (seq === searchSeq.current) {
              setLoading(false)
              setStreaming(false)
            }
          }
        },
        [query, mode, filters],
      )

      useEffect(() => {
        if (query.trim() === '' || composing) return undefined
        const controller = new AbortController()
        const timer = setTimeout(() => {
          search(controller.signal)
        }, 130)
        return () => {
          clearTimeout(timer)
          controller.abort()
        }
      }, [query, mode, filters, refreshNonce, search, composing])

      useEffect(() => {
        if (query.trim() !== '') return
        setData(null)
        setDetail(null)
        setSelectedId('')
        selectedIdRef.current = ''
      }, [query])

      useEffect(() => {
        if (selectedId === '') {
          setDetail(null)
          return undefined
        }
        const controller = new AbortController()
        post({ action: 'detail', id: selectedId }, controller.signal)
          .then((value) => setDetail(value))
          .catch((failure) => {
            if (failure.name !== 'AbortError') setDetail(null)
          })
        return () => controller.abort()
      }, [selectedId])

      const flat = useMemo(() => flatten(data), [data])
      const previewTextRef = useRef(null)

      /* Restore the list's reading position and the selected hit after a Session round-trip. */
      useEffect(() => {
        if (data === null || streaming || data.groups.length === 0) return undefined
        const list = listRef.current
        if (list === null) return undefined
        const frame = requestAnimationFrame(() => {
          if (restoreScroll.current > 0) {
            list.scrollTop = Math.min(restoreScroll.current, list.scrollHeight)
            restoreScroll.current = 0
          }
          const element = list.querySelector('[data-dsss-hit="' + cssEscape(selectedIdRef.current) + '"]')
          if (element === null) return
          const box = list.getBoundingClientRect()
          const row = element.getBoundingClientRect()
          if (row.top < box.top + 44 || row.bottom > box.bottom) element.scrollIntoView({ block: 'nearest' })
        })
        return () => cancelAnimationFrame(frame)
      }, [data, streaming])

      useEffect(() => {
        if (detail === null) return undefined
        const frame = requestAnimationFrame(() => {
          const box = previewTextRef.current
          if (box === null) return
          const mark = box.querySelector('mark')
          if (mark !== null) {
            const delta = mark.getBoundingClientRect().top - box.getBoundingClientRect().top
            box.scrollTop = Math.max(0, box.scrollTop + delta - 28)
          } else {
            box.scrollTop = 0
          }
        })
        return () => cancelAnimationFrame(frame)
      }, [detail, selectedId])

      useEffect(() => {
        const element = document.querySelector(`[data-dsss-hit="${cssEscape(selectedId)}"]`)
        element?.scrollIntoView({ block: 'nearest' })
      }, [selectedId])

      const selectRelative = useCallback(
        (delta) => {
          if (flat.length === 0) return
          const current = flat.findIndex((item) => item.hit.id === selectedIdRef.current)
          const next = current < 0 ? 0 : clamp(current + delta, 0, flat.length - 1)
          const id = flat[next].hit.id
          setSelectedId(id)
          selectedIdRef.current = id
        },
        [flat],
      )

      const runSelected = useCallback(() => {
        const found = flat.find((item) => item.hit.id === selectedIdRef.current)
        if (found === undefined) return
        openTarget(ctxRef.current, found.group.id, { ...found.hit, query })
      }, [flat, query])

      const ctxRef = useRef(null)

      useEffect(() => {
        ctxRef.current = props.ctx ?? null
      })

      const onKeyDown = useCallback(
        (event) => {
          if (openMenu !== '' && event.key !== 'Escape') return
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            selectRelative(1)
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            selectRelative(-1)
          } else if (event.key === 'Escape') {
            if (openMenu !== '') {
              setOpenMenu('')
              event.stopPropagation()
              return
            }
            if (selectedId !== '') {
              setSelectedId('')
              selectedIdRef.current = ''
              return
            }
            try {
              props.ctx?.get('layout')?.selectPanel(null)
            } catch {
              /* ignore */
            }
          }
        },
        [selectRelative, runSelected, flat.length, openMenu, selectedId],
      )

      const updateFilter = (patch) => {
        retryCount.current = 0
        const next = sanitizeFilters({ ...filters, ...patch })
        setFilters(next)
        save({ filters: next })
      }

      const submit = () => {
        const trimmed = query.trim()
        if (trimmed === '') return
        const nextRecent = [trimmed, ...recent.filter((item) => item !== trimmed)].slice(0, 6)
        setRecent(nextRecent)
        save({ recent: nextRecent })
        /* Enter is a search action, never a jump. */
        setRefreshNonce((nonce) => nonce + 1)
      }

      const reset = () => {
        const next = sanitizeFilters({
          position: 'any',
          range: 'all',
          from: '',
          to: '',
          kinds: DEFAULT_KINDS.slice(),
          fileKinds: [],
          exts: [],
          workspaces: [],
          sort: 'newest',
          caseSensitive: false,
          wholeWord: false,
          includeTitle: true,
        })
        setFilters(next)
        save({ filters: next })
        setOpenMenu('')
      }

      const bounds = rangeBounds(filters)
      const activeCount = countFilters(filters)
      const workspaces = status?.facets?.workspaces ?? []
      const exts = status?.facets?.exts ?? ALL_EXTS
      const selectedHit = flat.find((item) => item.hit.id === selectedId)
      const isBuilding = building || data?.state?.building === true
      const progress = status?.progress ?? data?.state?.progress ?? { done: 0, total: 0 }

      const rangeLabel = (() => {
        if (filters.range === 'custom') {
          if (filters.from === '' && filters.to === '') return t('custom')
          return `${filters.from || '…'} → ${filters.to || '…'}`
        }
        const preset = RANGE_PRESETS.find((item) => item.value === filters.range)
        return preset === undefined ? t('all') : t(preset.key)
      })()

      const contentLabel = (() => {
        if (filters.kinds.length === DEFAULT_KINDS.length && DEFAULT_KINDS.every((kind) => filters.kinds.includes(kind))) {
          return t('any')
        }
        const names = filters.kinds
          .map((kind) => {
            const option = KIND_OPTIONS.find((item) => item.value === kind)
            return option === undefined ? kind : t(option.key)
          })
          .slice(0, 3)
        return names.join(' / ') + (filters.kinds.length > 3 ? '…' : '')
      })()

      const fileLabel = (() => {
        if (filters.fileKinds.length === 0 && filters.exts.length === 0) return t('any')
        const parts = []
        if (filters.fileKinds.length > 0) {
          parts.push(
            filters.fileKinds
              .map((kind) => {
                const option = FILE_KINDS.find((item) => item.value === kind)
                return option === undefined ? kind : t(option.key)
              })
              .join('/'),
          )
        }
        if (filters.exts.length > 0) parts.push(filters.exts.slice(0, 3).map((ext) => `.${ext}`).join(' ') + (filters.exts.length > 3 ? '…' : ''))
        return parts.join(' · ')
      })()

      const workspaceLabel = (() => {
        if (filters.workspaces.length === 0) return t('all')
        if (filters.workspaces.length === 1) return baseName(filters.workspaces[0])
        return tOf(t, 'spacesChosen', { n: filters.workspaces.length })
      })()

      const toggleKind = (kind) => {
        if (filters.kinds.includes(kind)) {
          if (filters.kinds.length === 1) {
            toast(t('emptyKinds'))
            return
          }
          updateFilter({ kinds: filters.kinds.filter((item) => item !== kind) })
        } else {
          updateFilter({ kinds: [...filters.kinds, kind] })
        }
      }

      const toggleFileKind = (kind) => {
        const next = filters.fileKinds.includes(kind) ? filters.fileKinds.filter((item) => item !== kind) : [...filters.fileKinds, kind]
        const kinds = next.length > 0 && !filters.kinds.includes('f') ? [...filters.kinds, 'f'] : filters.kinds
        updateFilter({ fileKinds: next, kinds })
      }

      const toggleExt = (ext) => {
        const next = filters.exts.includes(ext) ? filters.exts.filter((item) => item !== ext) : [...filters.exts, ext]
        const kinds = next.length > 0 && !filters.kinds.includes('f') ? [...filters.kinds, 'f'] : filters.kinds
        updateFilter({ exts: next, kinds })
      }

      const toggleWorkspace = (cwd) => {
        updateFilter({
          workspaces: filters.workspaces.includes(cwd) ? filters.workspaces.filter((item) => item !== cwd) : [...filters.workspaces, cwd],
        })
      }

      const chooseQuery = (value, nextMode) => {
        restoreScroll.current = 0
        retryCount.current = 0
        setQuery(value)
        if (nextMode === 'regex' || nextMode === 'word') setMode(nextMode)
        setOpenMenu('')
        const nextRecent = [value, ...recent.filter((item) => item !== value)].slice(0, 6)
        setRecent(nextRecent)
        save({ query: value, recent: nextRecent, mode: nextMode ?? mode })
      }

      const resultCount = data?.totalHits ?? 0
      const statusLine = isBuilding
        ? `${t('buildingShort')} ${progress.total > 0 ? `${progress.done}/${progress.total}` : ''}`
        : status?.error !== null && status?.error !== undefined
          ? t('errorShort')
          : t('ready')

      return h(
        'div',
        { className: 'dsss-root', ref: rootRef, onKeyDown, tabIndex: -1 },
        h(
          'div',
          { className: 'dsss-wrap' },
          h(
            'header',
            { className: 'dsss-head' },
            h(
              'div',
              { className: 'dsss-head-copy' },
              h('h1', { className: 'dsss-title' }, t('title')),
              h('p', { className: 'dsss-subtitle' }, t('subtitle')),
            ),
            h(
              'div',
              { className: 'dsss-head-meta' },
              h(
                'span',
                { className: `dsss-status${isBuilding ? ' is-building' : ''}${status?.error ? ' is-error' : ''}`, title: status?.error ?? '' },
                h('span', { className: 'dsss-status-dot' }),
                statusLine,
              ),
              status === null
                ? null
                : h(
                    'span',
                    { className: 'dsss-meta-stat' },
                    `${formatNumber(status.sessions ?? 0, locale)} ${t('sessions')}`,
                    h('span', { className: 'dsss-meta-sep' }, '·'),
                    `${formatNumber(status.docs ?? 0, locale)} ${t('segments')}`,
                  ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsss-icon-btn',
                  title: t('rebuild'),
                  onClick: () => {
                    post({ action: 'reindex' }).then(setStatus).catch(() => undefined)
                  },
                },
                h(IconRefresh),
              ),
            ),
          ),

          h(
            'div',
            { className: 'dsss-search' },
            h('span', { className: 'dsss-search-icon' }, h(IconSearch, { size: 18, weight: 1.9 })),
            h('input', {
              ref: inputRef,
              className: 'dsss-input',
              value: query,
              placeholder: t('placeholder'),
              spellCheck: false,
              autoCapitalize: 'off',
              autoComplete: 'off',
              'aria-label': t('title'),
              onChange: (event) => {
                restoreScroll.current = 0
                retryCount.current = 0
                setQuery(event.target.value)
                save({ query: event.target.value })
              },
              onCompositionStart: () => setComposing(true),
              onCompositionEnd: (event) => {
                setComposing(false)
                setQuery(event.target.value)
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter' && !event.isComposing) submit()
              },
            }),
            query === ''
              ? null
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsss-clear-btn',
                    title: t('clearQuery'),
                    onClick: () => {
                      setQuery('')
                      save({ query: '' })
                      inputRef.current?.focus()
                    },
                  },
                  h(IconClose),
                ),
            h(
              'div',
              { className: 'dsss-mode' },
              h(Segmented, {
                value: mode,
                compact: true,
                options: [
                  { value: 'word', label: t('keyword') },
                  { value: 'regex', label: t('regex') },
                ],
                onChange: (value) => {
                  setMode(value)
                  save({ mode: value })
                },
              }),
            ),
          ),

          h(
            'div',
            { className: 'dsss-filterbar' },
            h(
              Chip,
              {
                label: `${t('position')} · ${filters.position === 'any' ? t('any') : filters.position === 'user' ? t('me') : t('ai')}`,
                active: filters.position !== 'any',
                open: openMenu === 'position',
                onClick: () => setOpenMenu(openMenu === 'position' ? '' : 'position'),
              },
              h(
                Popover,
                { open: openMenu === 'position', onClose: () => setOpenMenu(''), width: 220 },
                h(Segmented, {
                  value: filters.position,
                  options: [
                    { value: 'any', label: t('any') },
                    { value: 'user', label: t('me') },
                    { value: 'assistant', label: t('ai') },
                  ],
                  onChange: (value) => {
                    updateFilter({ position: value })
                    setOpenMenu('')
                  },
                }),
              ),
            ),
            h(
              Chip,
              {
                label: `${t('time')} · ${rangeLabel}`,
                active: filters.range !== 'all',
                open: openMenu === 'time',
                onClick: () => setOpenMenu(openMenu === 'time' ? '' : 'time'),
              },
              h(
                Popover,
                { open: openMenu === 'time', onClose: () => setOpenMenu(''), width: 268 },
                RANGE_PRESETS.map((preset) =>
                  h(
                    'button',
                    {
                      key: preset.value,
                      type: 'button',
                      className: `dsss-menu-row${filters.range === preset.value ? ' is-on' : ''}`,
                      onClick: () => {
                        updateFilter({ range: preset.value })
                        if (preset.value !== 'custom') setOpenMenu('')
                      },
                    },
                    h('span', null, t(preset.key)),
                    filters.range === preset.value ? h('span', { className: 'dsss-menu-check' }, '✓') : null,
                  ),
                ),
                filters.range === 'custom'
                  ? h(
                      'div',
                      { className: 'dsss-dates' },
                      h(
                        'label',
                        { className: 'dsss-date' },
                        h('span', null, t('from')),
                        h('input', {
                          type: 'date',
                          value: filters.from,
                          onChange: (event) => updateFilter({ from: event.target.value }),
                        }),
                      ),
                      h(
                        'label',
                        { className: 'dsss-date' },
                        h('span', null, t('to')),
                        h('input', {
                          type: 'date',
                          value: filters.to,
                          onChange: (event) => updateFilter({ to: event.target.value }),
                        }),
                      ),
                    )
                  : null,
              ),
            ),
            h(
              Chip,
              {
                label: `${t('content')} · ${contentLabel}`,
                active: filters.kinds.length !== DEFAULT_KINDS.length || !DEFAULT_KINDS.every((kind) => filters.kinds.includes(kind)),
                open: openMenu === 'content',
                onClick: () => setOpenMenu(openMenu === 'content' ? '' : 'content'),
              },
              h(
                Popover,
                { open: openMenu === 'content', onClose: () => setOpenMenu(''), width: 250 },
                h(
                  'div',
                  { className: 'dsss-menu-title' },
                  t('content'),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsss-menu-link',
                      onClick: () => updateFilter({ kinds: DEFAULT_KINDS.slice() }),
                    },
                    t('reset'),
                  ),
                ),
                KIND_OPTIONS.map((option) =>
                  h(Toggle, {
                    key: option.value,
                    on: filters.kinds.includes(option.value),
                    label: t(option.key),
                    onChange: () => toggleKind(option.value),
                  }),
                ),
              ),
            ),
            h(
              Chip,
              {
                label: `${t('files')} · ${fileLabel}`,
                active: filters.fileKinds.length > 0 || filters.exts.length > 0,
                open: openMenu === 'files',
                onClick: () => setOpenMenu(openMenu === 'files' ? '' : 'files'),
              },
              h(
                Popover,
                { open: openMenu === 'files', onClose: () => setOpenMenu(''), width: 320, align: 'left' },
                h(
                  'div',
                  { className: 'dsss-menu-title' },
                  t('files'),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsss-menu-link',
                      onClick: () => updateFilter({ fileKinds: [], exts: [] }),
                    },
                    t('clear'),
                  ),
                ),
                h(
                  'div',
                  { className: 'dsss-grid' },
                  FILE_KINDS.map((option) =>
                    h(
                      'button',
                      {
                        key: option.value,
                        type: 'button',
                        className: `dsss-token${filters.fileKinds.includes(option.value) ? ' is-on' : ''}`,
                        onClick: () => toggleFileKind(option.value),
                      },
                      t(option.key),
                    ),
                  ),
                ),
                h('div', { className: 'dsss-menu-caption' }, t('ext')),
                h(
                  'div',
                  { className: 'dsss-exts' },
                  exts.slice(0, 18).map((item) =>
                    h(
                      'button',
                      {
                        key: item.ext,
                        type: 'button',
                        className: `dsss-ext${filters.exts.includes(item.ext) ? ' is-on' : ''}`,
                        onClick: () => toggleExt(item.ext),
                        title: `${item.ext} · ${item.count}`,
                      },
                      `.${item.ext}`,
                    ),
                  ),
                ),
                h('p', { className: 'dsss-menu-hint' }, t('filterHintFiles')),
              ),
            ),
            h(
              Chip,
              {
                label: `${t('workspace')} · ${workspaceLabel}`,
                active: filters.workspaces.length > 0,
                open: openMenu === 'workspace',
                onClick: () => setOpenMenu(openMenu === 'workspace' ? '' : 'workspace'),
              },
              h(
                Popover,
                { open: openMenu === 'workspace', onClose: () => setOpenMenu(''), width: 340 },
                h(
                  'div',
                  { className: 'dsss-menu-title' },
                  t('chooseSpaces'),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsss-menu-link',
                      onClick: () => updateFilter({ workspaces: [] }),
                    },
                    t('clearSpaces'),
                  ),
                ),
                h(
                  'div',
                  { className: 'dsss-space-list' },
                  workspaces.length === 0
                    ? h('div', { className: 'dsss-menu-hint' }, t('loading'))
                    : workspaces.map((item) =>
                        h(
                          'button',
                          {
                            key: item.cwd,
                            type: 'button',
                            className: `dsss-space${filters.workspaces.includes(item.cwd) ? ' is-on' : ''}`,
                            onClick: () => toggleWorkspace(item.cwd),
                          },
                          h(
                            'span',
                            { className: 'dsss-space-copy' },
                            h('span', { className: 'dsss-space-name' }, baseName(item.cwd)),
                            h('span', { className: 'dsss-space-path', title: item.cwd }, shortPath(item.cwd)),
                          ),
                          h('span', { className: 'dsss-space-count' }, formatNumber(item.sessions, locale)),
                        ),
                      ),
                ),
              ),
            ),
            h(
              Chip,
              {
                label: `${t('sort')} · ${t(filters.sort)}`,
                active: filters.sort !== 'relevance',
                open: openMenu === 'sort',
                onClick: () => setOpenMenu(openMenu === 'sort' ? '' : 'sort'),
              },
              h(
                Popover,
                { open: openMenu === 'sort', onClose: () => setOpenMenu(''), width: 190 },
                ['newest', 'relevance', 'oldest'].map((value) =>
                  h(
                    'button',
                    {
                      key: value,
                      type: 'button',
                      className: `dsss-menu-row${filters.sort === value ? ' is-on' : ''}`,
                      onClick: () => {
                        updateFilter({ sort: value })
                        setOpenMenu('')
                      },
                    },
                    h('span', null, t(value)),
                    filters.sort === value ? h('span', { className: 'dsss-menu-check' }, '✓') : null,
                  ),
                ),
              ),
            ),
            h(
              Chip,
              {
                label: `${t('more')}${activeCount > 0 ? ` · ${activeCount}` : ''}`,
                active: filters.caseSensitive || filters.wholeWord || filters.includeTitle === false,
                open: openMenu === 'more',
                onClick: () => setOpenMenu(openMenu === 'more' ? '' : 'more'),
              },
              h(
                Popover,
                { open: openMenu === 'more', onClose: () => setOpenMenu(''), width: 264, align: 'right' },
                h(Toggle, {
                  on: filters.caseSensitive,
                  label: t('caseSensitive'),
                  onChange: (value) => updateFilter({ caseSensitive: value }),
                }),
                h(Toggle, {
                  on: filters.wholeWord,
                  label: t('wholeWord'),
                  onChange: (value) => updateFilter({ wholeWord: value }),
                }),
                h(Toggle, {
                  on: filters.includeTitle,
                  label: t('includeTitle'),
                  onChange: (value) => updateFilter({ includeTitle: value }),
                }),
                mode === 'regex' ? h('p', { className: 'dsss-menu-hint' }, t('regexHint')) : null,
                h(
                  'button',
                  { type: 'button', className: 'dsss-reset', onClick: reset },
                  t('reset'),
                ),
              ),
            ),
            h('span', { className: 'dsss-filter-spacer' }),
            activeCount > 0
              ? h(
                  'button',
                  { type: 'button', className: 'dsss-reset-inline', onClick: reset },
                  t('reset'),
                )
              : null,
          ),

          error !== ''
            ? h(
                'div',
                { className: 'dsss-alert' },
                h('span', { className: 'dsss-alert-title' }, t('error')),
                h('span', { className: 'dsss-alert-text' }, error),
              )
            : null,

          h(
            'div',
            { className: `dsss-panel${loading ? ' is-loading' : ''}${query.trim() === '' || (data !== null && data.groups.length === 0) ? ' is-empty' : ''}` },
            h(
              'div',
              {
                className: 'dsss-list',
                ref: listRef,
                onScroll: (event) => {
                  scrollPos.current = event.currentTarget.scrollTop
                  if (scrollSaveTimer.current !== null) clearTimeout(scrollSaveTimer.current)
                  scrollSaveTimer.current = setTimeout(() => {
                    scrollSaveTimer.current = null
                    save({ scroll: scrollPos.current })
                  }, 400)
                },
              },
              query.trim() === ''
                ? h(EmptyState, {
                    t,
                    status,
                    recent,
                    isZh,
                    onPick: chooseQuery,
                  })
                : data === null && isLoadingInitial(loading, status)
                  ? h(BuildingState, { t, progress, status })
                  : data !== null && data.groups.length === 0
                    ? h(
                        'div',
                        { className: 'dsss-empty' },
                        h('div', { className: 'dsss-empty-glyph' }, h(IconSearch, { size: 26, weight: 1.4 })),
                        h('h3', { className: 'dsss-empty-title' }, t('noResults')),
                        h('p', { className: 'dsss-empty-hint' }, t('noResultsHint')),
                        h(
                          'button',
                          { type: 'button', className: 'dsss-btn ghost', onClick: reset },
                          t('reset'),
                        ),
                      )
                    : data === null
                      ? h(BuildingState, { t, progress, status })
                      : data.groups.map((group) =>
                          h(
                            'section',
                            { key: group.id, className: 'dsss-group' },
                            h(
                              'div',
                              {
                                className: 'dsss-group-head',
                                title: group.cwd,
                                role: 'heading',
                                'aria-level': 2,
                              },
                              h(
                                'span',
                                { className: `dsss-group-mark${group.live ? ' is-live' : ''}` },
                                h(IconSession, { size: 14 }),
                              ),
                              h(
                                'span',
                                { className: 'dsss-group-copy' },
                                h('span', { className: 'dsss-group-title' }, group.title === '' ? t('noTitle') : group.title),
                                h('span', { className: 'dsss-group-path' }, shortPath(group.cwd)),
                              ),
                              group.live ? h('span', { className: 'dsss-live' }, t('live')) : null,
                              h('span', { className: 'dsss-group-count' }, group.total ?? group.hits.length),
                              h('span', { className: 'dsss-group-time' }, formatTime(group.updatedAt, isZh)),
                            ),
                            group.hits.map((hit, index) =>
                              h(HitRow, {
                                key: hit.id,
                                hit,
                                group,
                                index,
                                selected: hit.id === selectedId,
                                isZh,
                                t,
                                locale,
                                onSelect: () => selectHit(hit.id),
                                onOpen: () => openHit(group, hit),
                              }),
                            ),
                          ),
                        ),
              data !== null && data.truncated
                ? h(
                    'div',
                    { className: 'dsss-trunc' },
                    h('strong', null, t('truncated')),
                    h('span', null, t('truncatedHint')),
                  )
                : null,
            ),
            query.trim() === '' || (data !== null && data.groups.length === 0) ? null : h(Preview, {
              t,
              locale,
              isZh,
              textRef: previewTextRef,
              hit: selectedHit?.hit ?? null,
              group: selectedHit?.group ?? null,
              detail,
              query,
              mode,
              filters,
              onOpen: () => {
                if (selectedHit !== undefined) openHit(selectedHit.group, selectedHit.hit)
              },
              onCopy: () => {
                if (detail?.text !== undefined) {
                  navigator.clipboard?.writeText(detail.text).then(() => toast(t('copied'))).catch(() => undefined)
                }
              },
            }),
          ),

          h(
            'footer',
            { className: 'dsss-foot' },
            h('span', null, t('footerKeys')),
            h(
              'span',
              { className: 'dsss-foot-stats' },
              data === null
                ? `${formatNumber(status?.sessions ?? 0, locale)} ${t('sessions')}`
                : `${formatNumber(data.scanned, locale)} ${t('segments')}`,
              h('span', { className: 'dsss-meta-sep' }, '·'),
              `${formatNumber(resultCount, locale)} ${t('hits')}`,
              h('span', { className: 'dsss-meta-sep' }, '·'),
              `${data?.took ?? 0} ms`,
              status === null ? null : h('span', { className: 'dsss-meta-sep' }, '·'),
              status === null ? null : `${formatBytes((status.chars ?? 0) * 2)} ${t('indexed')}`,
              h('span', { className: 'dsss-build' }, BUILD),
            ),
          ),
        ),
      )
    }

    // #endregion

    // #region subviews --------------------------------------------------------

    function flatten(data) {
      if (data === null || !Array.isArray(data.groups)) return []
      const out = []
      for (const group of data.groups) {
        for (const hit of group.hits) out.push({ hit, group })
      }
      return out
    }

    function isLoadingInitial(loading, status) {
      return loading || status?.building === true || (status?.sessions ?? 0) === 0
    }

    function countFilters(filters) {
      let count = 0
      if (filters.position !== 'any') count += 1
      if (filters.range !== 'all') count += 1
      if (filters.kinds.length !== DEFAULT_KINDS.length || !DEFAULT_KINDS.every((kind) => filters.kinds.includes(kind))) count += 1
      if (filters.fileKinds.length > 0 || filters.exts.length > 0) count += 1
      if (filters.workspaces.length > 0) count += 1
      if (filters.sort !== 'newest') count += 1
      if (filters.caseSensitive || filters.wholeWord || filters.includeTitle === false) count += 1
      return count
    }

    function EmptyState(props) {
      const { t, status, recent, isZh, onPick } = props
      const examples = [
        { query: '日报' },
        { query: 'Failed' },
        { query: 'apply_patch' },
        { query: 'package.json' },
        { query: '\\.md$', mode: 'regex' },
      ]
      const building = status?.building === true
      return h(
        'div',
        { className: 'dsss-empty dsss-empty-hero' },
        h('div', { className: 'dsss-hero-glyph' }, h(IconSearch, { size: 30, weight: 1.3 })),
        h('h3', { className: 'dsss-empty-title' }, t('emptyTitle')),
        h('p', { className: 'dsss-empty-hint' }, t('emptyHint')),
        recent.length > 0
          ? h(
              'div',
              { className: 'dsss-picks' },
              h('span', { className: 'dsss-picks-label' }, t('recent')),
              recent.map((item) =>
                h(
                  'button',
                  { key: item, type: 'button', className: 'dsss-pick', onClick: () => onPick(item) },
                  item,
                ),
              ),
            )
          : h(
              'div',
              { className: 'dsss-picks' },
              h('span', { className: 'dsss-picks-label' }, t('examples')),
              examples.map((item) =>
                h(
                  'button',
                  {
                    key: item.query,
                    type: 'button',
                    className: 'dsss-pick is-mono',
                    title: item.mode === 'regex' ? 'regex' : undefined,
                    onClick: () => onPick(item.query, item.mode),
                  },
                  item.query,
                ),
              ),
            ),
        building
          ? h(BuildingState, { t, progress: status.progress, status, compact: true })
          : h(
              'div',
              { className: 'dsss-stats' },
              h(Stat, { label: t('sessions'), value: formatNumber(status?.sessions ?? 0, isZh ? 'zh' : 'en') }),
              h(Stat, { label: t('segments'), value: formatNumber(status?.docs ?? 0, isZh ? 'zh' : 'en') }),
              h(Stat, { label: t('indexed'), value: formatBytes((status?.chars ?? 0) * 2) }),
              h(Stat, { label: t('buildTime'), value: `${status?.buildMs ?? 0} ms` }),
            ),
        status?.error
          ? h('p', { className: 'dsss-empty-error' }, `${t('indexError')} ${status.error}`)
          : null,
      )
    }

    function Stat(props) {
      return h(
        'div',
        { className: 'dsss-stat' },
        h('span', { className: 'dsss-stat-value' }, props.value),
        h('span', { className: 'dsss-stat-label' }, props.label),
      )
    }

    function BuildingState(props) {
      const { t, progress, status, compact } = props
      const done = progress?.done ?? 0
      const total = progress?.total ?? 0
      const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
      return h(
        'div',
        { className: `dsss-building${compact ? ' is-compact' : ''}` },
        h(
          'div',
          { className: 'dsss-building-head' },
          h('span', { className: 'dsss-building-title' }, t('building')),
          h('span', { className: 'dsss-building-count' }, tOf(t, 'indexingCount', { done, total })),
        ),
        h('div', { className: 'dsss-progress' }, h('span', { className: 'dsss-progress-bar', style: { width: `${percent}%` } })),
        h('p', { className: 'dsss-building-hint' }, t('buildingHint')),
        status?.error ? h('p', { className: 'dsss-empty-error' }, status.error) : null,
      )
    }

    /** Where the match sits: the user's question, the AI answer, or the execution path. */
    function locationOf(hit) {
      if (hit.kind === 'title') return 'meta'
      if (hit.kind === 'reasoning') return 'thought'
      if (hit.kind === 'tool' || hit.kind === 'output' || hit.role === 'tool') return 'execute'
      if (hit.role === 'user') return 'ask'
      if (hit.kind === 'file' && typeof hit.call === 'string' && hit.call !== '') return 'execute'
      return 'answer'
    }

    /** What kind of record matched, independent of where it sits. */
    function contentLabelOf(hit, t) {
      if (hit.kind === 'file') return hit.ext === '' ? t('file') : `.${hit.ext}`
      if (hit.kind === 'tool') return t('toolCall')
      if (hit.kind === 'output') return t('toolOutput')
      if (hit.kind === 'reasoning') return t('reasoningBody')
      if (hit.kind === 'attachment') return t('attachment')
      if (hit.kind === 'summary') return t('summary')
      if (hit.kind === 'title') return t('sessionLabel')
      return t('body')
    }

    function HitRow(props) {
      const { hit, group, selected, isZh, t, onSelect, onOpen } = props
      const location = locationOf(hit)
      const kindLabel = contentLabelOf(hit, t)
      return h(
        'div',
        {
          role: 'button',
          tabIndex: 0,
          className: `dsss-hit${selected ? ' is-selected' : ''}`,
          onClick: onSelect,
          onDoubleClick: onOpen,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              onSelect()
            }
          },
          'data-dsss-hit': hit.id,
          'aria-current': selected ? 'true' : undefined,
          title: t('openResult'),
        },
        h('span', { className: `dsss-hit-rail dsss-role-${hit.role} dsss-kind-${hit.kind}` }),
        h(
          'span',
          { className: 'dsss-hit-body' },
          h(
            'span',
            { className: 'dsss-hit-snippet' },
            h(Marked, { text: hit.snippet.text, ranges: hit.snippet.ranges }),
          ),
          h(
            'span',
            { className: 'dsss-hit-meta' },
            h('span', { className: `dsss-loc dsss-loc-${location}` }, t(location)),
            hit.turn > 0 ? h('span', { className: 'dsss-hit-turn' }, tOf(t, 'turn', { n: hit.turn })) : null,
            h('span', { className: 'dsss-hit-kind' }, kindLabel),
            hit.matches > 1 ? h('span', { className: 'dsss-hit-count' }, tOf(t, 'matchCount', { n: hit.matches })) : null,
            h('span', { className: 'dsss-hit-time' }, formatTime(hit.time, isZh)),
            hit.files?.length > 0 ? h('span', { className: 'dsss-hit-file' }, shortPath(hit.files[0])) : null,
          ),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dsss-hit-open',
            title: t('open'),
            'aria-label': t('open'),
            onClick: (event) => {
              event.stopPropagation()
              onOpen()
            },
            onDoubleClick: (event) => event.stopPropagation(),
            onKeyDown: (event) => event.stopPropagation(),
          },
          h(IconArrow),
        ),
      )
    }

    function Preview(props) {
      const { t, isZh, hit, group, detail, query, mode, filters, onOpen, onCopy, textRef } = props
      if (hit === null || group === null) {
        return h(
          'aside',
          { className: 'dsss-preview is-idle' },
          h(
            'div',
            { className: 'dsss-preview-idle' },
            h('span', { className: 'dsss-preview-kbd' }, isMac() ? '↵' : 'Enter'),
            h('p', null, t('openHint')),
          ),
        )
      }
      const options = { regex: mode === 'regex', caseSensitive: filters.caseSensitive, wholeWord: filters.wholeWord }
      const text = detail?.text ?? hit.snippet.text
      const ranges = detail === null ? [] : findRanges(text, query, options)
      const location = locationOf(hit)
      const kindLabel = contentLabelOf(hit, t)
      return h(
        'aside',
        { className: 'dsss-preview' },
        h(
          'div',
          { className: 'dsss-preview-head' },
          h(
            'div',
            { className: 'dsss-preview-badges' },
            h('span', { className: `dsss-loc dsss-loc-${location}` }, t(location)),
            h('span', { className: 'dsss-badge' }, kindLabel),

          ),
          h(
            'div',
            { className: 'dsss-preview-actions' },
            h(
              'button',
              { type: 'button', className: 'dsss-icon-btn', title: t('copyText'), onClick: onCopy },
              h(IconCopy),
            ),
            h(
              'button',
              { type: 'button', className: 'dsss-btn primary', onClick: onOpen },
              t('open'),
              h(IconArrow),
            ),
          ),
        ),
        h(
          'div',
          { className: 'dsss-preview-meta' },
          h('span', { className: 'dsss-preview-title', title: group.title }, group.title === '' ? t('noTitle') : group.title),
          h(
            'span',
            { className: 'dsss-preview-sub' },
            shortPath(group.cwd),
            h('span', { className: 'dsss-meta-sep' }, '·'),
            formatTime(hit.time, isZh),
            hit.turn > 0 ? h('span', { className: 'dsss-meta-sep' }, '·') : null,
            hit.turn > 0 ? tOf(t, 'turn', { n: hit.turn }) : null,
          ),
        ),
        h(
          'div',
          { className: 'dsss-preview-text', ref: textRef },
          detail === null
            ? h('div', { className: 'dsss-preview-loading' }, t('loading'))
            : h(Marked, { text: truncateMiddle(text, 7_000), ranges: ranges.filter((range) => range[1] <= 7_000) }),
        ),
        hit.files?.length > 0
          ? h(
              'div',
              { className: 'dsss-preview-files' },
              h('div', { className: 'dsss-menu-caption' }, t('fileTypes')),
              hit.files.map((file) =>
                h(
                  'button',
                  {
                    key: file,
                    type: 'button',
                    className: 'dsss-filechip',
                    title: file,
                    onClick: () => navigator.clipboard?.writeText(file).then(() => toast(t('copied'))).catch(() => undefined),
                  },
                  h('span', { className: 'dsss-filechip-ext' }, `.${file.split('.').pop() ?? ''}`),
                  h('span', { className: 'dsss-filechip-name' }, shortPath(file)),
                ),
              ),
            )
          : null,
        h(
          'div',
          { className: 'dsss-preview-foot' },
          h('span', null, t('openHint')),
          h('kbd', { className: 'dsss-kbd' }, isMac() ? '↵' : 'Enter'),
        ),
      )
    }

    function truncateMiddle(text, max) {
      if (typeof text !== 'string' || text.length <= max) return text
      return `${text.slice(0, max)}…`
    }

    function cssEscape(value) {
      try {
        return globalThis.CSS?.escape !== undefined ? CSS.escape(value) : String(value).replace(/["\\]/g, '\\$&')
      } catch {
        return String(value).replace(/["\\]/g, '\\$&')
      }
    }

    // #endregion

    // #region styles ----------------------------------------------------------

    const CSS = `
.dsss-root{--dsss-font:var(--dsw-font-family);height:100%;min-height:0;display:flex;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsss-font);overflow:hidden;outline:none}
.dsss-wrap{flex:1;min-width:0;min-height:0;max-width:1240px;margin:0 auto;padding:22px 30px 0;display:flex;flex-direction:column;gap:14px}
.dsss-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-top:2px}
.dsss-head-copy{min-width:0}
.dsss-title{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.dsss-subtitle{margin:3px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dsss-head-meta{display:flex;align-items:center;gap:10px;padding-top:5px;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}
.dsss-status{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:11px}
.dsss-status-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-static-green-500,#41c977);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-static-green-500,#41c977) 16%,transparent)}
.dsss-status.is-building .dsss-status-dot{background:var(--dsw-static-amber-500,#f0a33a);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-static-amber-500,#f0a33a) 18%,transparent);animation:dsss-pulse 1.4s ease-in-out infinite}
.dsss-status.is-error .dsss-status-dot{background:var(--dsw-static-red-500,#e5484d)}
.dsss-meta-stat{font-variant-numeric:tabular-nums}
.dsss-meta-sep{opacity:.45;margin:0 5px}
.dsss-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background .12s ease,color .12s ease}
.dsss-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsss-search{display:flex;align-items:center;gap:10px;height:48px;padding:0 10px 0 14px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv1);transition:border-color .14s ease,box-shadow .14s ease}
.dsss-search:focus-within{border-color:var(--dsw-static-deepseek-400,#7aaaff);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 13%,transparent)}
.dsss-search-icon{display:inline-flex;color:var(--dsw-alias-label-tertiary)}
.dsss-input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font-family:var(--dsss-font);font-size:15px;letter-spacing:.005em}
.dsss-input::placeholder{color:var(--dsw-alias-label-caption)}
.dsss-clear-btn{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);cursor:pointer}
.dsss-clear-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsss-mode{display:flex;align-items:center}
.dsss-seg{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.dsss-seg.is-compact{border-radius:8px}
.dsss-seg-btn{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-family:var(--dsss-font);font-size:12px;line-height:20px;padding:3px 9px;border-radius:6px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease}
.dsss-seg-btn:hover{color:var(--dsw-alias-label-primary)}
.dsss-seg-btn.is-on{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv1);font-weight:500}
.dsss-kbd{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:5px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.02em}
.dsss-filterbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-height:30px;position:relative;z-index:100}
.dsss-chipwrap{position:relative}
.dsss-chip{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 9px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font-family:var(--dsss-font);font-size:12px;cursor:pointer;transition:background .12s ease,border-color .12s ease,color .12s ease}
.dsss-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsss-chip.is-on{border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 30%,transparent);background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 9%,transparent);color:var(--dsw-alias-label-primary)}
.dsss-chip.is-open{background:var(--dsw-alias-interactive-bg-active)}
.dsss-chip-label{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsss-chip-chevron{display:inline-flex;opacity:.55}
.dsss-chip-wrap-wide{min-width:0}
.dsss-filter-spacer{flex:1;min-width:8px}
.dsss-reset-inline{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-family:var(--dsss-font);font-size:11px;cursor:pointer;padding:4px 6px;border-radius:6px}
.dsss-reset-inline:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsss-menu{position:absolute;top:calc(100% + 6px);z-index:110;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv3);padding:6px;animation:dsss-pop .13s ease}
.dsss-menu-inner{max-height:min(64vh,440px);overflow:auto;display:flex;flex-direction:column;gap:2px}
.dsss-menu-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-family:var(--dsss-font);font-size:12px;line-height:18px;padding:7px 9px;border-radius:7px;cursor:pointer;text-align:left}
.dsss-menu-row:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsss-menu-row.is-on{color:var(--dsw-alias-label-primary)}
.dsss-menu-check{color:var(--dsw-static-deepseek-500,#4176e6);font-size:12px}
.dsss-menu-title{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 4px 6px;color:var(--dsw-alias-label-secondary);font-size:11px;letter-spacing:.02em}
.dsss-menu-link{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-family:var(--dsss-font);font-size:11px;cursor:pointer;padding:2px 4px;border-radius:5px}
.dsss-menu-link:hover{color:var(--dsw-static-deepseek-500,#4176e6)}
.dsss-menu-caption{padding:7px 4px 3px;color:var(--dsw-alias-label-caption);font-size:10px;letter-spacing:.04em;text-transform:uppercase}
.dsss-menu-hint{padding:6px 4px 2px;margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.dsss-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:10px;border:0;background:transparent;padding:7px 9px;border-radius:7px;cursor:pointer;text-align:left}
.dsss-toggle-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsss-toggle-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsss-toggle-label{color:var(--dsw-alias-label-secondary);font-family:var(--dsss-font);font-size:12px;line-height:18px}
.dsss-toggle-hint{color:var(--dsw-alias-label-caption);font-size:10px}
.dsss-switch{position:relative;width:28px;height:16px;border-radius:999px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);flex:none;transition:background .14s ease,border-color .14s ease}
.dsss-switch-dot{position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:var(--dsw-alias-label-caption);transition:transform .14s ease,background .14s ease}
.dsss-switch.is-on{background:var(--dsw-static-deepseek-500,#4176e6);border-color:transparent}
.dsss-switch.is-on .dsss-switch-dot{transform:translateX(12px);background:#fff}
.dsss-grid{display:flex;flex-wrap:wrap;gap:5px;padding:2px 2px 4px}
.dsss-token{height:24px;padding:0 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-family:var(--dsss-font);font-size:11px;cursor:pointer}
.dsss-token:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.dsss-token.is-on{border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 40%,transparent);background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 10%,transparent);color:var(--dsw-alias-label-primary)}
.dsss-exts{display:flex;flex-wrap:wrap;gap:4px;padding:2px}
.dsss-ext{border:1px solid transparent;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:18px;padding:1px 6px;border-radius:5px;cursor:pointer}
.dsss-ext:hover{color:var(--dsw-alias-label-primary)}
.dsss-ext.is-on{background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 14%,transparent);color:var(--dsw-static-deepseek-600,#4868b2);border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 32%,transparent)}
.dsss-dates{display:flex;gap:8px;padding:6px 4px 2px;border-top:1px solid var(--dsw-alias-border-l1);margin-top:4px}
.dsss-date{display:flex;flex-direction:column;gap:3px;font-size:10px;color:var(--dsw-alias-label-caption);flex:1;min-width:0}
.dsss-date input{width:100%;height:26px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:var(--dsss-font);font-size:11px;padding:0 6px;outline:none}
.dsss-space-list{display:flex;flex-direction:column;gap:1px;max-height:280px;overflow:auto}
.dsss-space{display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:6px 8px;border-radius:7px;cursor:pointer;text-align:left}
.dsss-space:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsss-space.is-on{background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 9%,transparent)}
.dsss-space-copy{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.dsss-space-name{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px}
.dsss-space-path{color:var(--dsw-alias-label-caption);font-size:10px;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:rtl;text-align:left}
.dsss-space-count{color:var(--dsw-alias-label-caption);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
.dsss-reset{width:100%;margin-top:4px;border:0;border-top:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-tertiary);font-family:var(--dsss-font);font-size:11px;padding:8px;cursor:pointer}
.dsss-reset:hover{color:var(--dsw-alias-label-primary)}
.dsss-panel{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,380px);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;box-shadow:var(--dsw-shadow-lv1);z-index:0}
.dsss-panel.is-empty{grid-template-columns:minmax(0,1fr)}
.dsss-panel.is-empty .dsss-list{display:flex;align-items:center;justify-content:center;padding:0 24px 18px}
.dsss-panel.is-empty .dsss-empty{width:100%;max-width:760px}
.dsss-panel.is-loading::before{content:'';position:absolute;top:0;left:0;z-index:6;width:36%;height:2px;background:var(--dsw-static-deepseek-450,#5686fe);animation:dsss-indeterminate 1.1s ease-in-out infinite;pointer-events:none}
.dsss-list{min-height:0;overflow:auto;padding:0 0 18px;scroll-padding-top:46px;scrollbar-width:thin}
.dsss-list::-webkit-scrollbar{width:8px}
.dsss-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l3);border-radius:4px}
.dsss-group{display:flex;flex-direction:column;padding-top:0;isolation:isolate;content-visibility:auto;contain-intrinsic-size:auto 260px}
.dsss-group-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:9px;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 0 var(--dsw-alias-border-l1),0 10px 18px -20px #000;padding:9px 14px 8px;text-align:left;cursor:default}

.dsss-group-mark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);flex:none}
.dsss-group-mark.is-live{color:var(--dsw-static-green-600,#2f9e5f);background:color-mix(in srgb,var(--dsw-static-green-500,#41c977) 12%,transparent)}
.dsss-group-copy{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.dsss-group-title{color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:18px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsss-group-path{color:var(--dsw-alias-label-caption);font-size:10.5px;line-height:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsss-group-count{min-width:18px;height:18px;padding:0 5px;border-radius:5px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:18px;text-align:center}
.dsss-group-time{color:var(--dsw-alias-label-caption);font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
.dsss-live{color:var(--dsw-static-green-600,#2f9e5f);font-size:10px;padding:1px 5px;border-radius:4px;background:color-mix(in srgb,var(--dsw-static-green-500,#41c977) 12%,transparent)}
.dsss-hit{position:relative;display:flex;align-items:stretch;gap:0;width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:pointer;color:inherit;scroll-margin-top:46px;outline:none}
.dsss-hit:focus-visible{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 45%,transparent)}
.dsss-hit:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsss-hit.is-selected{background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 7%,transparent)}
.dsss-hit-rail{width:2px;margin:8px 0 8px 12px;border-radius:2px;background:transparent;flex:none}
.dsss-hit.is-selected .dsss-hit-rail{background:var(--dsw-static-deepseek-450,#5686fe)}
.dsss-role-user.dsss-hit-rail{background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 45%,transparent)}
.dsss-role-assistant.dsss-hit-rail{background:var(--dsw-alias-border-l3)}
.dsss-role-tool.dsss-hit-rail{background:color-mix(in srgb,var(--dsw-static-amber-500,#f0a33a) 62%,transparent)}
.dsss-kind-file.dsss-hit-rail{background:color-mix(in srgb,var(--dsw-static-teal-500,#2aa6a0) 55%,transparent)}
.dsss-kind-reasoning.dsss-hit-rail{background:var(--dsw-alias-border-l2)}
.dsss-hit-body{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;padding:8px 12px 8px 10px}
.dsss-hit-snippet{color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:20px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.dsss-hit-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--dsw-alias-label-caption);font-size:10px;line-height:14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsss-loc{display:inline-flex;align-items:center;justify-content:center;height:17px;padding:0 5px;border-radius:4px;border:1px solid transparent;font-family:var(--dsss-font);font-size:9.5px;line-height:17px;font-weight:500;letter-spacing:.02em;flex:none;white-space:nowrap}
.dsss-loc-ask{color:var(--dsw-static-deepseek-600,#4868b2);background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 11%,transparent);border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 26%,transparent)}
.dsss-loc-answer{color:var(--dsw-static-green-700,#2f7d52);background:color-mix(in srgb,var(--dsw-static-green-500,#41c977) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-static-green-500,#41c977) 26%,transparent)}
.dsss-loc-execute{color:var(--dsw-static-amber-700,#a6600a);background:color-mix(in srgb,var(--dsw-static-amber-500,#f0a33a) 14%,transparent);border-color:color-mix(in srgb,var(--dsw-static-amber-500,#f0a33a) 30%,transparent)}
.dsss-loc-thought{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.dsss-loc-summary,.dsss-loc-meta{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.dsss-hit-meta .dsss-loc{margin-right:1px}
.dsss-preview-badges .dsss-loc{height:20px;font-size:10px;line-height:20px;padding:0 7px;border-radius:5px}
.dsss-hit-kind{color:var(--dsw-alias-label-tertiary);padding:0 4px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);font-family:var(--dsss-font);font-size:10px}
.dsss-hit-turn{color:var(--dsw-alias-label-tertiary);font-family:var(--dsss-font)}
.dsss-hit-file{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary)}
.dsss-hit-open{display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin:auto 8px auto 2px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-tertiary);opacity:.38;cursor:pointer;flex:none;padding:0;transition:opacity .12s ease,border-color .12s ease,background .12s ease,color .12s ease}
.dsss-hit:hover .dsss-hit-open,.dsss-hit.is-selected .dsss-hit-open,.dsss-hit-open:focus-visible{opacity:1}
.dsss-hit:hover .dsss-hit-open{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.dsss-hit-open:hover{border-color:color-mix(in srgb,var(--dsw-static-deepseek-450,#5686fe) 70%,transparent);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-static-deepseek-500,#4176e6)}
.dsss-hit-open:focus-visible{outline:none;border-color:color-mix(in srgb,var(--dsw-static-deepseek-450,#5686fe) 80%,transparent)}
.dsss-hit-selected{position:absolute;right:12px;bottom:6px;font-size:9px;color:var(--dsw-static-deepseek-500,#4176e6);opacity:0}
.dsss-mark{background:color-mix(in srgb,var(--dsw-static-deepseek-400,#7aaaff) 38%,transparent);color:var(--dsw-alias-label-primary);border-radius:3px;padding:0 1px;box-decoration-break:clone}
.dsss-preview{border-left:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);display:flex;flex-direction:column;min-height:0;overflow:hidden}
.dsss-preview.is-idle{align-items:center;justify-content:center}
.dsss-preview-idle{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--dsw-alias-label-caption);font-size:11px}
.dsss-preview-kbd{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,monospace;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.dsss-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px 8px}
.dsss-preview-badges{display:flex;align-items:center;gap:6px;min-width:0}
.dsss-badge{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:5px;font-size:10px;letter-spacing:.02em;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1)}
.dsss-badge.dsss-role-user{color:var(--dsw-static-deepseek-600,#4868b2);background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 9%,transparent);border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 24%,transparent)}
.dsss-badge.dsss-role-tool{color:var(--dsw-alias-label-secondary)}
.dsss-badge-ghost{font-size:10px;color:var(--dsw-alias-label-caption)}
.dsss-preview-actions{display:flex;align-items:center;gap:6px}
.dsss-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border-radius:7px;font-family:var(--dsss-font);font-size:12px;cursor:pointer;border:1px solid transparent}
.dsss-btn.primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dsss-btn.primary:hover{background:var(--dsw-alias-button-primary-hover)}
.dsss-btn.ghost{border-color:var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary)}
.dsss-btn.ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsss-preview-meta{display:flex;flex-direction:column;gap:3px;padding:2px 14px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsss-preview-title{font-size:13px;line-height:19px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsss-preview-sub{display:flex;align-items:center;gap:0;color:var(--dsw-alias-label-caption);font-size:10.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsss-preview-text{flex:1;min-height:0;overflow:auto;padding:14px;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:21px;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}
.dsss-preview-loading{color:var(--dsw-alias-label-caption);font-size:11px}
.dsss-preview-files{display:flex;flex-wrap:wrap;gap:5px;padding:8px 14px;border-top:1px solid var(--dsw-alias-border-l1);max-height:120px;overflow:auto}
.dsss-preview-files .dsss-menu-caption{width:100%;padding:0 0 2px}
.dsss-filechip{display:inline-flex;align-items:center;gap:5px;max-width:100%;height:22px;padding:0 6px;border-radius:5px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);font-size:10px;cursor:pointer}
.dsss-filechip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3)}
.dsss-filechip-ext{font-family:ui-monospace,monospace;color:var(--dsw-static-deepseek-500,#4176e6)}
.dsss-filechip-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
.dsss-preview-foot{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 10px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);font-size:10px}
.dsss-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:4px 2px 10px;color:var(--dsw-alias-label-caption);font-size:10.5px;white-space:nowrap;overflow:hidden}
.dsss-foot-stats{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis}
.dsss-build{opacity:.55;margin-left:8px}
.dsss-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:36px 24px;text-align:center}
.dsss-empty-hero{padding:42px 24px 28px}
.dsss-empty-glyph,.dsss-hero-glyph{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:16px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);margin-bottom:4px}
.dsss-hero-glyph{width:68px;height:68px;border-radius:20px;background:linear-gradient(145deg,color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 10%,transparent),transparent 65%),var(--dsw-alias-bg-layer-2);color:var(--dsw-static-deepseek-500,#4176e6)}
.dsss-empty-title{margin:0;font-size:15px;line-height:22px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsss-empty-hint{margin:0;max-width:480px;font-size:11.5px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dsss-picks{display:flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.dsss-picks-label{color:var(--dsw-alias-label-caption);font-size:10px;margin-right:2px}
.dsss-pick{height:24px;padding:0 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-family:var(--dsss-font);font-size:11px;cursor:pointer}
.dsss-pick:hover{border-color:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 35%,transparent);color:var(--dsw-alias-label-primary)}
.dsss-pick.is-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
.dsss-stats{display:flex;align-items:stretch;gap:10px;margin-top:18px;flex-wrap:wrap;justify-content:center}
.dsss-stat{display:flex;flex-direction:column;gap:1px;min-width:82px;padding:8px 12px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dsss-stat-value{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;line-height:20px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.dsss-stat-label{font-size:10px;color:var(--dsw-alias-label-caption);letter-spacing:.02em}
.dsss-empty-error{margin:8px 0 0;max-width:520px;color:var(--dsw-static-red-600,#c53b3f);font-size:11px;line-height:17px}
.dsss-building{display:flex;flex-direction:column;gap:7px;width:min(460px,100%);margin:14px auto;padding:14px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dsss-building.is-compact{width:min(520px,100%);margin-top:16px}
.dsss-building-head{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px}
.dsss-building-title{color:var(--dsw-alias-label-secondary)}
.dsss-building-count{color:var(--dsw-alias-label-caption);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsss-progress{height:4px;border-radius:2px;background:var(--dsw-alias-bg-layer-3);overflow:hidden}
.dsss-progress-bar{display:block;height:100%;border-radius:2px;background:var(--dsw-static-deepseek-450,#5686fe);transition:width .3s ease}
.dsss-building-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:16px}
.dsss-alert{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;border:1px solid color-mix(in srgb,var(--dsw-static-red-500,#e5484d) 28%,transparent);background:color-mix(in srgb,var(--dsw-static-red-500,#e5484d) 7%,transparent);font-size:11px;color:var(--dsw-alias-label-secondary);flex-wrap:wrap}
.dsss-alert-title{color:var(--dsw-static-red-600,#c53b3f);font-weight:500}
.dsss-alert-text{color:var(--dsw-alias-label-tertiary)}
.dsss-trunc{display:flex;flex-direction:column;gap:2px;margin:10px 14px 0;padding:8px 10px;border-radius:8px;border:1px dashed var(--dsw-alias-border-l2);color:var(--dsw-alias-label-caption);font-size:10.5px}
.dsss-trunc strong{color:var(--dsw-alias-label-secondary);font-weight:500}
@keyframes dsss-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes dsss-indeterminate{0%{transform:translateX(-110%)}100%{transform:translateX(320%)}}
@keyframes dsss-pop{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@media (max-width: 980px){.dsss-panel{grid-template-columns:minmax(0,1fr)}.dsss-preview{display:none}.dsss-wrap{padding:18px 18px 0}}
@media (max-width: 720px){.dsss-kbd{display:none}.dsss-head-meta .dsss-meta-stat{display:none}}
`

    function insertStyles() {
      const tag = document.createElement('style')
      tag.dataset.dshPlugin = 'dsh-deep-search'
      tag.textContent = CSS
      document.head.appendChild(tag)
      return () => tag.remove()
    }

    // #endregion

    // #region plugin ----------------------------------------------------------

    function PanelIcon(props) {
      return h(IconSearch, { size: props.size ?? 16, weight: props.active ? 2 : 1.8 })
    }

    function apply(ctx) {
      const t = ctx.locale.bind(NS)
      ctx.effect(() => ctx.locale.register(NS, DICT), 'deep-search: dictionaries')
      ctx.effect(() => insertStyles(), 'deep-search: styles')







      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: -1,
                label: () => t('panel'),
                locale: NS,
              },
              PanelIcon,
            ),
          ),
        'deep-search: sidebar entry',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: PANEL_ID,
                locale: NS,
                inject: () => ({ ctx }),
              },
              SessionSearchPage,
            ),
          ),
        'deep-search: main panel',
      )
    }

    return { inject: ['slots', 'locale'], apply, __test: { locationOf, contentLabelOf, HitRow, Preview } }
  },
})
