import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdir, rename, rm, access } from 'node:fs/promises'

// 当前文件所在目录（ESM 下没有 __dirname）
const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * 扁平化 MPA HTML 产物插件
 * Vite 默认按输入路径保留目录结构（dist/src/pages/xxx.html），
 * 该插件在构建收尾时把所有 HTML 产物移动到 dist 根目录，使 nginx 可直接以
 * /student-home.html 等路径托管。资源引用为绝对路径（/assets/...），
 * 移动 HTML 不会破坏引用。
 */
function flatMpaHtmlPlugin() {
  let outDirAbs = ''
  return {
    name: 'flat-mpa-html',
    apply: 'build',
    configResolved(config) {
      outDirAbs = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      if (!outDirAbs) return
      // 递归查找 dist 下所有 .html，把不在根目录的移到根目录
      const moveHtmlFrom = async (dir) => {
        let entries = []
        try {
          entries = await readdir(dir, { withFileTypes: true })
        } catch {
          return
        }
        for (const entry of entries) {
          const full = resolve(dir, entry.name)
          if (entry.isDirectory()) {
            await moveHtmlFrom(full)
          } else if (entry.name.endsWith('.html') && dir !== outDirAbs) {
            const target = resolve(outDirAbs, entry.name)
            try {
              await access(target)
              // 根目录已存在同名文件则跳过（避免覆盖）
            } catch {
              await rename(full, target)
            }
          }
        }
      }
      await moveHtmlFrom(outDirAbs)
      // 清理空的 src 目录
      try {
        await rm(resolve(outDirAbs, 'src'), { recursive: true, force: true })
      } catch {
        /* 忽略 */
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  // 多页面应用（MPA）：4 个独立 HTML 入口
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'student-home': resolve(__dirname, 'src/pages/student-home.html'),
        'skill-diagnosis': resolve(__dirname, 'src/pages/skill-diagnosis.html'),
        'personalized-practice': resolve(__dirname, 'src/pages/personalized-practice.html'),
        'exam-simulation': resolve(__dirname, 'src/pages/exam-simulation.html'),
      },
    },
  },
  plugins: [flatMpaHtmlPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
