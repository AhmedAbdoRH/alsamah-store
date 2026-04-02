import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Use esbuild for minification (faster and doesn't require terser)
    minify: 'esbuild',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      'react-helmet-async',
    ],
  },
  // Enable gzip compression
  server: {
    headers: {
      // Avoid aggressive caching in dev; rely on HMR
      'Cache-Control': 'no-store',
    },
    watch: {
      // Ignore files that may be updated by editors, tools, or local diagnostics.
      ignored: [
        '**/dist/**',
        '**/.bolt/**',
        '**/.idx/**',
        '**/.vscode/**',
        '**/public/sitemap.xml',
        '**/public/robots.txt',
        '**/*.bak',
        '**/*.tmp',
        '**/*.temp',
        '**/*.swp',
        '**/*.orig',
        '**/*.log',
        '**/env.tmp',
        '**/supabase/migrations/**',
      ],
    },
  },
});
