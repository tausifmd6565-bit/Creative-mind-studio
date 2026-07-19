import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    headers: {
      // Prevent MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // Deny framing to prevent clickjacking
      'X-Frame-Options': 'DENY',
      // Disable browser XSS filter (modern browsers use CSP instead)
      'X-XSS-Protection': '0',
      // Prevent referrer leakage
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Restrict browser feature access
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      // Content Security Policy — tighten before deploying to production:
      // Replace 'unsafe-inline' with nonce-based inline script/style policy.
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",   // tighten with nonces in prod
        "style-src 'self' 'unsafe-inline'",    // tighten with nonces in prod
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' http://localhost:8000 https://*.creativemind.io",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join('; '),
    },
  },

  build: {
    // Raise the warning threshold — single-page apps legitimately produce large bundles
    chunkSizeWarningLimit: 600,

    // Split CSS per code-split chunk so each workspace only loads its own styles.
    cssCodeSplit: true,

    // Emit a <modulepreload> polyfill so dynamic imports work in all modern browsers.
    modulePreload: { polyfill: true },

    // Rolldown/Rollup manual chunking strategy
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor: React core ──────────────────────────────────────────────
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // ── Vendor: Framer Motion ───────────────────────────────────────────
          if (id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/motion')) {
            return 'vendor-motion';
          }

          // ── Vendor: Recharts (chart heavy-hitter) ──────────────────────────
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-') ||
              id.includes('node_modules/victory')) {
            return 'vendor-charts';
          }

          // ── Vendor: Form libraries ─────────────────────────────────────────
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }

          // ── Vendor: Lucide icons ────────────────────────────────────────────
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }

          // ── Workspace: Analytics / Performance (Recharts-heavy) ───────────
          if (id.includes('/analytics/') ||
              id.includes('/virality-twin/') ||
              id.includes('AnalyticsCharts') ||
              id.includes('PerformanceWorkspace')) {
            return 'workspace-analytics';
          }

          // ── Workspace: Editor + Assets (media-heavy) ──────────────────────
          if (id.includes('/editor/') || id.includes('/assets/')) {
            return 'workspace-editor';
          }

          // ── Workspace: Auth + Onboarding ──────────────────────────────────
          if (id.includes('/auth/') || id.includes('/create-project/')) {
            return 'workspace-auth';
          }

          // ── Workspace: remaining project workspaces ────────────────────────
          if (id.includes('/strategy/') || id.includes('/research/') ||
              id.includes('/script/') || id.includes('/review/') ||
              id.includes('/distribution/')) {
            return 'workspace-project';
          }

          // ── Micro-interaction components ──────────────────────────────────
          if (id.includes('/components/micro/')) {
            return 'ui-micro';
          }
        },

        // Hash-based file names for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },

    // Minification settings — Vite 8 uses Rolldown/OXC; esbuild is not bundled
    minify: true,
    target: 'es2020',

    // Inline assets smaller than 8 KB (covers small SVG icons and data URLs)
    assetsInlineLimit: 8192,

    // Generate source maps for production debugging (disable in CI if size matters)
    sourcemap: false,

    // Report each transformed file — useful for auditing large modules in CI
    reportCompressedSize: true,
  },

  // Preview server
  preview: {
    port: 4173,
    strictPort: false,
  },

  // Optimise pre-bundled deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'recharts',
    ],
    // Recharts and its D3 sub-deps are CommonJS — force ESM conversion
    // Note: esbuildOptions is deprecated in Vite 8; use rolldownOptions
    rolldownOptions: {
      output: {
        target: 'es2020',
      },
    },
  },
})
