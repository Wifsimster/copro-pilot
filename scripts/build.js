#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Building CoproPilot Monorepo...\n')

const workspaces = [
    'apps/frontend'
]

workspaces.forEach(workspace => {
    const workspacePath = path.join(__dirname, '..', workspace)

    if (fs.existsSync(workspacePath)) {
        console.log(`Building ${workspace}...`)

        try {
            execSync('npm run build', {
                cwd: workspacePath,
                stdio: 'inherit'
            })
            console.log(`${workspace} built successfully\n`)
        } catch (error) {
            console.error(`Failed to build ${workspace}:`, error.message)
            process.exit(1)
        }
    }
})

console.log('All packages built successfully!')
