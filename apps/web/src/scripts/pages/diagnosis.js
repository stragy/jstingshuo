/* ==========================================================================
   pages/diagnosis.js —— 能力诊断渲染
   ========================================================================== */
import '../shell.js'
import { diagnosisData } from '../mock-data.js'
import { buildRadarSvg } from '../charts.js'

/** 渲染 5 维度大雷达图 */
function renderRadar() {
  const mount = document.getElementById('diag-radar')
  if (!mount) return
  const dims = diagnosisData.dimensions
  const avg = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length)
  mount.innerHTML = `
    ${buildRadarSvg(dims, { size: 260 })}
    <div class="radar-hero__summary">综合能力均分 <strong>${avg}</strong> 分，已识别 ${dims.filter((d) => d.weak).length} 项弱项</div>
  `
}

/** 渲染维度详情卡片 */
function renderDimensions() {
  const mount = document.getElementById('diag-dims')
  if (!mount) return
  mount.innerHTML = diagnosisData.dimensions
    .map(
      (d) => `
      <article class="dim-card">
        <div class="dim-card__head">
          <span class="dim-card__name">${d.name}</span>
          <span>
            <span class="dim-card__score">${d.score}</span><span class="dim-card__score-unit">分</span>
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill ${d.weak ? 'progress-bar__fill--warning' : ''}" style="width:${d.score}%"></div>
        </div>
        <div class="dim-card__foot">
          <div class="practice-card__row">
            ${
              d.weakTags.length
                ? d.weakTags
                    .map(
                      (t) =>
                        `<a class="tag tag--warning" href="personalized-practice.html" data-weak="${d.key}">${t} ›</a>`
                    )
                    .join('')
                : '<span class="muted">暂无明显弱项</span>'
            }
          </div>
        </div>
      </article>
    `
    )
    .join('')
}

function init() {
  renderRadar()
  renderDimensions()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
