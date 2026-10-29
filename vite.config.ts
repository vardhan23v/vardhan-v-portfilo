import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `ANALYZE=1 npm run build` writes an interactive treemap to dist/stats.html
    process.env.ANALYZE
      ? (visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true }) as PluginOption)
      : null,
  ],
  build: {
    reportCompressedSize: true,
    // Never base64-inline font files into the CSS (several subset woff2 files are under the
    // 4 kB default limit and would bloat the render-blocking index-*.css instead).
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
    // Vite 8 bundles with Rolldown: `codeSplitting.groups` is its replacement for
    // Rollup's `manualChunks` (and for the now-deprecated `advancedChunks`).
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
