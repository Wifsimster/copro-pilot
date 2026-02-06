import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

function getAppVersion() {
    const currentDir = dirname(fileURLToPath(import.meta.url))
    const possiblePaths = [
        join(currentDir, '../../package.json'),
        join(currentDir, '../../../package.json'),
        '/app/package.json',
    ]

    for (const packageJsonPath of possiblePaths) {
        try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
            return packageJson.version
        } catch {
            continue
        }
    }

    return '0.0.0'
}

const appVersion = getAppVersion()

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    css: {
        postcss: false
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                secure: false
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    },
    define: {
        __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
        __APP_VERSION__: JSON.stringify(appVersion)
    }
})
