import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ isSsrBuild }): UserConfig => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      !isSsrBuild &&
        visualizer({
          filename: 'dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          json: true,
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    ssr: {
      external: ['express', 'react', 'react-dom', 'react-router-dom'],
      noExternal: ['react-helmet-async'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    esbuild: {
      legalComments: 'none',
      drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      minify: 'esbuild',
      target: 'es2020',
      cssMinify: true,
      sourcemap: process.env.NODE_ENV === 'development',
      rollupOptions: isSsrBuild
        ? {}
        : {
            output: {
              manualChunks(id) {
                if (id.includes('node_modules')) {
                  // React & ReactDOM + scheduler runtime
                  if (
                    id.includes('/node_modules/react/') ||
                    id.includes('/node_modules/react-dom/') ||
                    id.includes('/node_modules/scheduler/')
                  ) {
                    return 'vendor-react';
                  }
                  // React Router
                  if (
                    id.includes('/node_modules/react-router/') ||
                    id.includes('/node_modules/react-router-dom/')
                  ) {
                    return 'vendor-router';
                  }
                  // React Helmet Async
                  if (
                    id.includes('/node_modules/react-helmet-async/') ||
                    id.includes('/node_modules/react-fast-compare/') ||
                    id.includes('/node_modules/invariant/') ||
                    id.includes('/node_modules/shallowequal/')
                  ) {
                    return 'vendor-helmet';
                  }
                  // Motion animation library
                  if (id.includes('/node_modules/motion/')) {
                    return 'vendor-motion';
                  }
                }

                // App-shared shell code (Navbar, Footer, shared UI & data utilities)
                if (
                  id.includes('/src/components/Navbar') ||
                  id.includes('/src/components/Footer') ||
                  id.includes('/src/components/UtoolsLogo') ||
                  id.includes('/src/components/ScrollToTop') ||
                  id.includes('/src/components/ToolSeoHead') ||
                  id.includes('/src/components/floating/') ||
                  id.includes('/src/utils/') ||
                  id.includes('/src/data/tools') ||
                  id.includes('/src/data/toolIcons')
                ) {
                  return 'app-shell';
                }
              },
            },
          },
    },
  };
});
