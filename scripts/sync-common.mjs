#!/usr/bin/env node
/**
 * 将 cloudfunctions/common 的公共代码同步到每个云函数的 lib/ 目录。
 *
 * 背景：微信云开发在部署时，每个云函数是相互隔离的独立包，
 * 无法 require 目录之外的代码。因此在部署前把公共层复制进各函数内部。
 *
 * 用法：npm run sync:common
 * 后续可选升级：改为使用云开发「公共层（Layer）」能力，则本脚本可废弃。
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const cloudfunctionsDir = join(projectRoot, 'cloudfunctions')
const commonDir = join(cloudfunctionsDir, 'common')

/** 不复制到 lib/ 的文件（package.json 会造成包名解析冲突） */
const EXCLUDE = new Set(['package.json', 'node_modules', '.DS_Store'])

function listCloudFunctions() {
  return readdirSync(cloudfunctionsDir).filter((name) => {
    if (name === 'common' || name.startsWith('.')) return false
    return statSync(join(cloudfunctionsDir, name)).isDirectory()
  })
}

function syncTo(fnName) {
  const targetDir = join(cloudfunctionsDir, fnName, 'lib')
  rmSync(targetDir, { recursive: true, force: true })
  mkdirSync(targetDir, { recursive: true })

  for (const file of readdirSync(commonDir)) {
    if (EXCLUDE.has(file)) continue
    cpSync(join(commonDir, file), join(targetDir, file), { recursive: true })
  }
  console.log(`  \u2713 cloudfunctions/${fnName}/lib`)
}

function main() {
  if (!existsSync(cloudfunctionsDir)) {
    console.error('未找到 cloudfunctions 目录，请确认在项目根目录执行。')
    process.exit(1)
  }

  const functions = listCloudFunctions()
  if (functions.length === 0) {
    console.warn('没有需要同步的云函数。')
    return
  }

  console.log('同步公共层 common \u2192 各云函数 lib/')
  functions.forEach(syncTo)
  console.log(`完成，共同步 ${functions.length} 个云函数。`)
}

main()
