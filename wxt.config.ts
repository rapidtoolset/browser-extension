import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'
import manifest from './extensions/tool-hub/manifest.config'

const root = import.meta.dirname

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: path.resolve(root, 'extensions', 'tool-hub', 'entrypoints'),
  publicDir: 'extensions/tool-hub/public',
  outDir: '.output',
  imports: false,
  manifest: (env) => {
    if (env.browser === 'firefox') {
      return {
        ...manifest,
        browser_specific_settings: {
          gecko: {
            data_collection_permissions: {
              required: ['none'],
            },
          },
        },
      }
    }
    return manifest
  },
  zip: {
    name: 'tool-hub',
    artifactTemplate: 'tool-hub-{{version}}-{{browser}}.zip',
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
      react(),
    ],
  }),
})
