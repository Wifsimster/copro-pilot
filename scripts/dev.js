#!/usr/bin/env node

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Starting ImmoIA Monorepo in development mode...\n')

const workspaces = [
    'apps/backend',
    'apps/frontend'
]

const processes = []

workspaces.forEach(workspace => {
    const workspacePath = path.join(__dirname, '..', workspace)
    const packageJsonPath = path.join(workspacePath, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

        if (packageJson.scripts && packageJson.scripts.start) {
            console.log(`Starting ${workspace}...`)

            const child = spawn('npm', ['run', 'start'], {
                cwd: workspacePath,
                stdio: 'inherit',
                shell: true
            })

            child.on('error', (error) => {
                console.error(`Error starting ${workspace}:`, error.message)
            })

            processes.push({ name: workspace, process: child })
        }
    }
})

process.on('SIGINT', () => {
    console.log('\nShutting down development servers...')

    processes.forEach(({ name, process: child }) => {
        console.log(`Stopping ${name}...`)
        child.kill('SIGINT')
    })

    setTimeout(() => {
        console.log('Development servers stopped')
        process.exit(0)
    }, 2000)
})

console.log(`\nStarted ${processes.length} development servers`)
console.log('Press Ctrl+C to stop all servers\n')
