/* ==========================================================================
   pages/exam.js —— 模拟考试渲染（含年份筛选）
   ========================================================================== */
import '../shell.js'
import { examData } from '../mock-data.js'

const STATUS_MAP = {
  todo: { label: '未开始', cls: 'badge--todo' },
  doing: { label: '进行中', cls: 'badge--doing' },
  done: { label: '已完成', cls: 'badge--done' },
}

let currentYear = 'all'

/** 渲染年份筛选 chips */
function renderFilters() {
  const mount = document.getElementById('exam-filters')
  if (!mount) return
  mount.innerHTML = examData.years
    .map(
      (y) => `
      <button class="chip ${y.key === currentYear ? 'is-active' : ''}" data-year="${y.key}" type="button">${y.label}</button>
    `
    )
    .join('')
}

/** 渲染单张试卷卡片 */
function renderCard(p) {
  const status = STATUS_MAP[p.status]
  let body = ''
  if (p.status === 'done') {
    body = `
      <div class="exam-card__score">
        <span class="exam-card__score-num">${p.score}</span><span class="exam-card__score-unit">分</span>
      </div>
    `
  } else if (p.status === 'doing') {
    body = `
      <div class="exam-card__progress">
        <div class="exam-card__progress-text"><span>作答进度</span><span>${p.progress}%</span></div>
        <div class="progress-bar"><div class="progress-bar__fill" style="width:${p.progress}%"></div></div>
      </div>
    `
  } else {
    body = `<button class="btn btn--outline btn--sm" type="button" data-action="start-exam" data-id="${p.id}">开始考试</button>`
  }

  return `
    <article class="exam-card">
      <div class="exam-card__head">
        <h3 class="exam-card__title">${p.title}</h3>
        <span class="badge ${status.cls}">${status.label}</span>
      </div>
      <div class="exam-card__meta">
        <span class="exam-card__meta-item">${p.year} 年</span>
        <span class="exam-card__meta-item">${p.duration} 分钟</span>
        <span class="exam-card__meta-item">${p.questionCount} 题</span>
      </div>
      ${body}
    </article>
  `
}

/** 渲染试卷列表 */
function renderList() {
  const mount = document.getElementById('exam-list')
  if (!mount) return
  const items = examData.papers.filter(
    (p) => currentYear === 'all' || String(p.year) === currentYear
  )
  mount.innerHTML = items.length
    ? items.map(renderCard).join('')
    : '<p class="muted text-center" style="padding:24px 0">暂无该年份的试卷</p>'
}

/** 渲染考试流程预览说明 */
function renderFlow() {
  const mount = document.getElementById('exam-flow')
  if (!mount) return
  mount.innerHTML = `
    <div class="info-block__title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
      考试流程预览
    </div>
    <div class="info-block__list">
      ${examData.flowSteps
        .map(
          (step, i) => `
        <div class="info-block__step">
          <span class="info-block__step-no">${i + 1}</span>
          <span>${step}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
}

/** 绑定筛选交互 */
function bindFilters() {
  const mount = document.getElementById('exam-filters')
  if (!mount) return
  mount.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-year]')
    if (!chip) return
    currentYear = chip.dataset.year
    renderFilters()
    renderList()
  })
}

function init() {
  renderFilters()
  renderList()
  renderFlow()
  bindFilters()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
