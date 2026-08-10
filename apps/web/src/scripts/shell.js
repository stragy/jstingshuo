/* ==========================================================================
   shell.js —— 应用 shell（顶部栏渲染 + 底部 Tab 切换）
   每个页面通过 <script type="module" src="..."> 引入本文件即可自动初始化。
   页面需在 <body data-page="home|diagnosis|practice|exam" data-title="页面标题">
   并提供 #app-topbar 与 #app-tabbar 两个挂载点。
   ========================================================================== */

/** Tab 配置：key -> { label, page(用于判断高亮), url, icon } */
const TABS = [
  {
    key: 'home',
    label: '首页',
    url: 'student-home.html',
    icon: `<svg class="app-tabbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
  },
  {
    key: 'diagnosis',
    label: '诊断',
    url: 'skill-diagnosis.html',
    icon: `<svg class="app-tabbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 3-4 3 3 4-6"/></svg>`,
  },
  {
    key: 'practice',
    label: '练习',
    url: 'personalized-practice.html',
    icon: `<svg class="app-tabbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>`,
  },
  {
    key: 'exam',
    label: '考试',
    url: 'exam-simulation.html',
    icon: `<svg class="app-tabbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  },
]

/** 通知铃铛图标 */
const BELL_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`

/** 渲染顶部栏 */
function renderTopbar(mount, title, hasNotice) {
  mount.innerHTML = `
    <h1 class="app-topbar__title">${title}</h1>
    <button class="app-topbar__bell" type="button" aria-label="通知" data-action="notice">
      ${BELL_ICON}
      ${hasNotice ? '<span class="app-topbar__bell-dot"></span>' : ''}
    </button>
  `
}

/** 渲染底部 Tab 栏 */
function renderTabbar(mount, currentPage) {
  mount.innerHTML = TABS.map((tab) => {
    const active = tab.key === currentPage
    // 与设计稿交互映射保持一致：当前页用 tab-{key}-active，其余用 tab-{key}
    const domId = `tab-${tab.key}${active ? '-active' : ''}`
    return `
      <a
        id="${domId}"
        class="app-tabbar__item${active ? ' is-active' : ''}"
        href="${tab.url}"
        data-tab="${tab.key}"
        aria-label="${tab.label}"
        ${active ? 'aria-current="page"' : ''}
      >
        ${tab.icon}
        <span class="app-tabbar__label">${tab.label}</span>
      </a>
    `
  }).join('')
}

/** 绑定 Tab 切换（点击跳转对应 HTML 页面） */
function bindTabNavigation(mount) {
  mount.addEventListener('click', (event) => {
    const item = event.target.closest('[data-tab]')
    if (!item) return
    event.preventDefault()
    const url = item.getAttribute('href')
    if (url) window.location.assign(url)
  })
}

/** 初始化 shell */
export function initShell() {
  const body = document.body
  const currentPage = body.dataset.page || 'home'
  const title = body.dataset.title || '慧听说'
  const hasNotice = body.dataset.notice !== 'false'

  const topbar = document.getElementById('app-topbar')
  const tabbar = document.getElementById('app-tabbar')

  if (topbar) renderTopbar(topbar, title, hasNotice)
  if (tabbar) {
    renderTabbar(tabbar, currentPage)
    bindTabNavigation(tabbar)
  }
}

// 自动初始化（DOM 就绪后）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShell)
} else {
  initShell()
}

export default initShell
