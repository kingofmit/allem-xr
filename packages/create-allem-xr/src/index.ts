#!/usr/bin/env node

import { cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

function getVersion(): string {
  const pkgPath = resolve(__dirname, '..', 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  return pkg.version
}

function main() {
  const args = process.argv.slice(2)

  // Handle --version / -v
  if (args.includes('--version') || args.includes('-v')) {
    console.log(getVersion())
    process.exit(0)
  }

  const flags = args.filter(a => a.startsWith('-'))
  const positional = args.filter(a => !a.startsWith('-'))
  const projectName = positional[0]

  if (!projectName || flags.includes('--help') || flags.includes('-h')) {
    console.log(`
${BOLD}create-allem-xr${RESET} v${getVersion()} — scaffold a new mixed reality app

${BOLD}Usage:${RESET}
  npx create-allem-xr ${CYAN}<project-name>${RESET} [options]

${BOLD}Options:${RESET}
  -v, --version Print version number
  -h, --help    Show this help message

${BOLD}Example:${RESET}
  npx create-allem-xr my-xr-app
  cd my-xr-app
  npm install
  npm run dev
`)
    process.exit(projectName ? 0 : 1)
  }

  const targetDir = resolve(process.cwd(), projectName)

  if (existsSync(targetDir)) {
    console.error(`\n${BOLD}Error:${RESET} Directory "${projectName}" already exists.\n`)
    process.exit(1)
  }

  console.log(`\n${BOLD}Creating Allem XR app in ${CYAN}${targetDir}${RESET}...\n`)

  // Copy template
  const templateDir = resolve(__dirname, '..', 'template')
  cpSync(templateDir, targetDir, { recursive: true })

  // Update package.json with project name
  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.name = projectName
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Detect package manager
  const userAgent = process.env.npm_config_user_agent ?? ''
  let pm = 'npm'
  let runCmd = 'npm run'
  if (userAgent.startsWith('pnpm')) {
    pm = 'pnpm'
    runCmd = 'pnpm'
  } else if (userAgent.startsWith('yarn')) {
    pm = 'yarn'
    runCmd = 'yarn'
  } else if (userAgent.startsWith('bun')) {
    pm = 'bun'
    runCmd = 'bun run'
  }

  console.log(`${GREEN}\u2713${RESET} Project scaffolded successfully!\n`)
  console.log(`${BOLD}Next steps:${RESET}\n`)
  console.log(`  ${DIM}$${RESET} cd ${projectName}`)
  console.log(`  ${DIM}$${RESET} ${pm} install`)
  console.log(`  ${DIM}$${RESET} ${runCmd} dev`)
  console.log()
  console.log(`${DIM}Then open the URL on your Quest or Vision Pro to see it in XR.${RESET}`)
  console.log(`${DIM}Use the WebXR emulator extension for desktop development.${RESET}\n`)
}

main()
