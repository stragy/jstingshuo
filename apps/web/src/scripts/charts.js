/* ==========================================================================
   charts.js —— SVG 图表生成辅助（雷达图 / 进度环）
   纯函数返回 SVG 字符串，由页面脚本插入 DOM。
   ========================================================================== */

/** 角度转弧度 */
const toRad = (deg) => (deg * Math.PI) / 180

/**
 * 生成能力雷达图 SVG
 * @param {Array<{name:string, score:number}>} dims 维度数组（建议 5 个，0-100 分）
 * @param {Object} opts { size=260, max=100, showLabels=true }
 * @returns {string} SVG 字符串
 */
export function buildRadarSvg(dims, opts = {}) {
  const size = opts.size ?? 260
  const max = opts.max ?? 100
  const showLabels = opts.showLabels !== false

  const cx = size / 2
  const cy = size / 2
  // 为标签留出空间
  const radius = size / 2 - (showLabels ? 38 : 12)
  const n = dims.length
  // 从正上方开始，顺时针
  const angles = dims.map((_, i) => -90 + (360 / n) * i)

  // 某一比例（0-1）下的多边形顶点
  const polygonAt = (ratio) =>
    angles
      .map((a) => {
        const r = radius * ratio
        return `${(cx + r * Math.cos(toRad(a))).toFixed(2)},${(cy + r * Math.sin(toRad(a))).toFixed(2)}`
      })
      .join(' ')

  // 网格环（25% / 50% / 75% / 100%）
  const rings = [0.25, 0.5, 0.75, 1]
    .map((ratio) => `<polygon class="radar-grid" points="${polygonAt(ratio)}"/>`)
    .join('')

  // 轴线
  const axes = angles
    .map((a) => {
      const x = cx + radius * Math.cos(toRad(a))
      const y = cy + radius * Math.sin(toRad(a))
      return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}"/>`
    })
    .join('')

  // 数据多边形
  const dataPoints = dims.map((d, i) => {
    const ratio = Math.min(Math.max(d.score / max, 0), 1)
    const r = radius * ratio
    const a = angles[i]
    return `${(cx + r * Math.cos(toRad(a))).toFixed(2)},${(cy + r * Math.sin(toRad(a))).toFixed(2)}`
  })

  // 数据顶点圆点
  const vertices = dims
    .map((d, i) => {
      const ratio = Math.min(Math.max(d.score / max, 0), 1)
      const r = radius * ratio
      const a = angles[i]
      const x = cx + r * Math.cos(toRad(a))
      const y = cy + r * Math.sin(toRad(a))
      return `<circle class="radar-vertex" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3"/>`
    })
    .join('')

  // 维度标签
  const labels = showLabels
    ? dims
        .map((d, i) => {
          const a = angles[i]
          const rLabel = radius + 18
          const x = cx + rLabel * Math.cos(toRad(a))
          const y = cy + rLabel * Math.sin(toRad(a))
          const cosA = Math.cos(toRad(a))
          const sinA = Math.sin(toRad(a))
          // 水平对齐：右侧 start、左侧 end、正上下 middle
          let anchor = 'middle'
          if (cosA > 0.3) anchor = 'start'
          else if (cosA < -0.3) anchor = 'end'
          // 垂直对齐：顶部文字在点上、底部文字在点下、两侧居中
          let baseline = 'middle'
          if (sinA < -0.5) baseline = 'auto'
          else if (sinA > 0.5) baseline = 'hanging'
          return `<text class="radar-label" x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="${baseline}">${d.name}</text>`
        })
        .join('')
    : ''

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="能力雷达图">
      ${rings}
      ${axes}
      <polygon class="radar-polygon" points="${dataPoints.join(' ')}"/>
      ${vertices}
      ${labels}
    </svg>
  `.trim()
}

/**
 * 生成进度环 SVG（圆环）
 * @param {number} current 当前值
 * @param {number} target  目标值
 * @param {number} size    SVG 尺寸
 * @returns {{ svg:string, circumference:number, offset:number }}
 */
export function buildProgressRing(current, target, size = 112) {
  const stroke = 10
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const ratio = target > 0 ? Math.min(Math.max(current / target, 0), 1) : 0
  const offset = circumference * (1 - ratio)

  const svg = `
    <svg class="progress-ring__svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="提分进度">
      <circle class="progress-ring__track" cx="${cx}" cy="${cy}" r="${r}"/>
      <circle class="progress-ring__fill" cx="${cx}" cy="${cy}" r="${r}"
        stroke-dasharray="${circumference.toFixed(2)}"
        stroke-dashoffset="${offset.toFixed(2)}"/>
    </svg>
  `.trim()

  return { svg, circumference, offset }
}

/** 生成难度星级 SVG（共 5 颗，filled 颗实心） */
export function buildStars(filled, total = 5) {
  const star = (on) => `
    <svg viewBox="0 0 24 24" fill="currentColor" class="${on ? '' : 'stars__dim'}">
      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.55l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"/>
    </svg>`
  let out = ''
  for (let i = 0; i < total; i++) out += star(i < filled)
  return `<span class="stars">${out}</span>`
}
