/* ==========================================================================
   pages/practice.js —— 定向练习渲染（含筛选 chips 单选）
   ========================================================================== */
import '../shell.js'
import { practiceData } from '../mock-data.js'
import { buildStars } from '../charts.js'

let currentFilter = 'all'

/** 渲染筛选 chips */
function renderFilters() {
  const mount = document.getElementById('practice-filters')
  if (!mount) return
  mount.innerHTML = practiceData.filters
    .map(
      (f) => `
      <button class="chip ${f.key === currentFilter ? 'is-active' : ''}" data-filter="${f.key}" type="button">${f.label}</button>
    `
    )
    .join('')
}

/** 渲染练习卡片列表 */
function renderList() {
  const mount = document.getElementById('practice-list')
  if (!mount) return
  const items = practiceData.items.filter(
    (i) => currentFilter === 'all' || i.type === currentFilter
  )
  mount.innerHTML = items.length
    ? items
        .map(
          (p) => `
        <article class="practice-card">
          <div class="practice-card__row">
            <span class="tag tag--neutral">${p.typeLabel}</span>
            ${buildStars(p.difficulty)}
          </div>
          <h3 class="practice-card__title">${p.title}</h3>
          <div class="practice-card__reason">
            <span class="practice-card__reason-label">匹配理由</span>
            <span class="practice-card__reason-text">${p.reason}</span>
          </div>
          <div class="practice-card__footer">
            <span class="muted">难度 ${p.difficulty}/5</span>
            <button class="btn btn--primary btn--sm" type="button" data-action="start" data-id="${p.id}">开始</button>
          </div>
        </article>
      `
        )
        .join('')
    : '<p class="muted text-center" style="padding:24px 0">暂无该类型的练习</p>'
}

/** 绑定筛选交互 */
function bindFilters() {
  const mount = document.getElementById('practice-filters')
  if (!mount) return
  mount.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]')
    if (!chip) return
    currentFilter = chip.dataset.filter
    renderFilters()
    renderList()
  })
}

function init() {
  renderFilters()
  renderList()
  bindFilters()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
