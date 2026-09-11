import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'
import manifest from './extensions/rapidtoolset/manifest.config'

const root = import.meta.dirname

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: path.resolve(root, 'extensions', 'rapidtoolset', 'entrypoints'),
  publicDir: 'extensions/rapidtoolset/public',
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
    name: 'rapidtoolset',
    artifactTemplate: 'rapidtoolset-{{version}}-{{browser}}.zip',
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
      react(),
    ],
  }),
})
