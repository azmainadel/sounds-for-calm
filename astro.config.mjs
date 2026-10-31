import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

/**
 * The app imports `react-icons/<set>/index`, which resolves to the CommonJS build and pulls every
 * icon of every set into the browser bundle (~23 MB), so nothing is interactive until it downloads.
 * For the browser build, point those imports at the tree-shakeable ESM files. Server rendering
 * keeps the CommonJS build, which Node loads fine (the ESM files use a directory import Node rejects).
 */
function reactIconsEsm() {
  return {
    enforce: 'pre',
    name: 'react-icons-esm',
    async resolveId(source, importer, options) {
      if (options?.ssr) return null;

      const set = source.match(/^react-icons\/([a-z0-9]+)\/index$/)?.[1];
      if (set) {
        return this.resolve(`react-icons/${set}/index.esm.js`, importer, {
          ...options,
          skipSelf: true,
        });
      }

      if (source === '../lib' && importer?.includes('/react-icons/')) {
        return this.resolve('react-icons/lib/esm/index.js', importer, {
          ...options,
          skipSelf: true,
        });
      }

      return null;
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [reactIconsEsm()],
  },
  fonts: [
    {
      cssVariable: '--font-dm-sans',
      name: 'DM Sans',
      provider: fontProviders.google(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: [400, 500, 600],
    },
    {
      cssVariable: '--font-instrument-serif',
      name: 'Instrument Serif',
      provider: fontProviders.google(),
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      weights: [400],
    },
  ],
  integrations: [
    react(),
    AstroPWA({
      manifest: {
        background_color: '#09090b',
        description: 'Ambient sounds for focus and calm.',
        display: 'standalone',
        icons: [
          ...[72, 128, 144, 152, 192, 256, 512].map(size => ({
            sizes: `${size}x${size}`,
            src: `/assets/pwa/${size}.png`,
            type: 'image/png',
          })),
        ],
        name: 'Sounds for Calm',
        orientation: 'any',
        scope: '/',
        short_name: 'Sounds for Calm',
        start_url: '/',
        theme_color: '#09090b',
      },
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['sounds/**/*', '_astro/event.*.js'],
        globPatterns: ['**/*.{css,html,ico,js,png,svg,webp,woff2}'],
        navigateFallback: '/',
        runtimeCaching: [
          {
            handler: 'CacheFirst',
            options: { cacheName: 'app-scripts' },
            urlPattern: ({ request, url }) =>
              request.destination === 'script' &&
              url.origin === self.location.origin,
          },
          {
            handler: 'CacheFirst',
            options: {
              cacheName: 'sounds',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
            urlPattern: ({ url }) => url.pathname.startsWith('/sounds/'),
          },
        ],
      },
    }),
  ],
});
