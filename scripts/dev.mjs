import { spawn } from 'node:child_process'
import { createConnection } from 'node:net'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const children = []
let stopping = false

function portOpen(port) {
  return new Promise(resolvePort => {
    const socket = createConnection({ host: '127.0.0.1', port })
    socket.once('connect', () => { socket.destroy(); resolvePort(true) })
    socket.once('error', () => resolvePort(false))
    socket.setTimeout(700, () => { socket.destroy(); resolvePort(false) })
  })
}

function run(label, command, args) {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit' })
  children.push(child)
  child.on('error', error => console.error(`${label}: ${error.message}`))
  child.on('exit', code => {
    if (!stopping && code) console.error(`${label} terminou com código ${code}.`)
  })
}

if (await portOpen(5000)) console.log('API já está ativa na porta 5000.')
else run('API', 'dotnet', ['run', '--project', 'backend', '--launch-profile', 'http'])
run('Site', process.execPath, ['node_modules/vite/bin/vite.js', '--open'])

function stop() {
  if (stopping) return
  stopping = true
  for (const child of children) if (!child.killed) child.kill()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
