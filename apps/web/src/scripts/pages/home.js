/* ==========================================================================
   pages/home.js —— 学生首页渲染
   ========================================================================== */
import '../shell.js'
import { homeData } from '../mock-data.js'
import { buildRadarSvg, buildProgressRing, buildStars } from '../charts.js'

/** 渲染提分进度环 */
function renderProgress() {
  const { target, current, gap } = homeData.progress
  const mount = document.getElementById('home-progress')
  if (!mount) return
  const { svg } = buildProgressRing(current, target, 112)
  mount.innerHTML = `
    ${svg}
    <div class="progress-ring__center">
      <div>
        <span class="progress-ring__score">${current}</span><span class="progress-ring__score-unit">分</span>
      </div>
      <div class="progress-ring__desc">
        目标 ${target} 分 · 当前 ${current} 分 · 还差 <strong>${gap}</strong> 分
      </div>
    </div>
  `
}

/** 渲染 2x2 统计网格 */
function renderStats() {
  const mount = document.getElementById('home-stats')
  if (!mount) return
  mount.innerHTML = homeData.stats
    .map(
      (s) => `
      <div class="stat-cell">
        <div class="stat-cell__value">${s.value}<span class="stat-cell__value-suffix">${s.suffix}</span></div>
        <div class="stat-cell__label">${s.label}</div>
      </div>
    `
    )
    .join('')
}

/** 渲染 AI 推荐任务（横向滑动） */
function renderTasks() {
  const mount = document.getElementById('home-tasks')
  if (!mount) return
  mount.innerHTML = homeData.recommendedTasks
    .map(
      (t) => `
      <article class="task-card">
        <div class="task-card__head">
          <span class="tag">${t.typeLabel}</span>
          ${buildStars(t.difficulty)}
        </div>
        <h3 class="task-card__title">${t.title}</h3>
        <div class="task-card__meta">${t.duration}</div>
        <div class="task-card__footer">
          <a class="btn btn--primary btn--sm" href="personalized-practice.html">开始练习</a>
        </div>
      </article>
    `
    )
    .join('')
}

/** 渲染能力雷达 mini */
function renderRadarMini() {
  const mount = document.getElementById('home-radar')
  if (!mount) return
  const dims = homeData.radar
  mount.innerHTML = `
    ${buildRadarSvg(dims, { size: 120, showLabels: false })}
    <div class="radar-mini__legend">
      ${dims
        .map(
          (d) => `
        <div class="radar-mini__legend-item">
          <span class="radar-mini__legend-name">${d.name}</span>
          <span class="radar-mini__legend-score" ${d.weak ? 'style="color:var(--state-warning)"' : ''}>${d.score}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
}

function init() {
  renderProgress()
  renderStats()
  renderTasks()
  renderRadarMini()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
