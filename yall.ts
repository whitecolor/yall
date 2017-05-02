#!/usr/bin/env node
import * as yargs from 'yargs'
import { YallOptions, runAll } from '.'

const yallFlags = [
  'concurrency', 'con',
  'fail-fast', 'npm',
  'folders', 'exclude-folders', 'here',
  'link-file', 'link-files',
  'watch',
  'run-lock', 'run-lock-all'
]

const cliCommand = 'yall'

interface Args extends YallOptions {
  _: string[]
}

const removeDoubleHypenFromArgv = () => {
  const rev = process.argv.concat([]).reverse()
  rev.forEach((arg, i) =>
    arg === '--' && process.argv.splice(rev.length - i - 1, 1)
  )
  return process.argv.slice(2)
}

yargs
  .usage(cliCommand + '[yarn|npm command] [yarn|npm flags] [yall flags]')
  .string(['cache-folder', 'modules-folder'])
  .option('concurrency', {
    alias: 'con',
    type: 'number',
    describe: 'Number of concurrenlty running commands',
    default: 10
  })
  .options('link-file', {
    alias: 'link-files',
    describe: 'Create symlinks for `file:` dependencies',
    type: 'boolean'
  })
  .string(['run-lock', 'run-lock-nested'])
  .array(['folders', 'exclude-folders', 'watch'])
  .boolean(['here', 'fail-fast', 'npm'])
  .help(true)
  .argv as Args

const argv = yargs.parse(removeDoubleHypenFromArgv()) as Args

process.stdin.setMaxListeners(0)
process.stdout.setMaxListeners(0)

const isFlag = (arg: string) => arg.match(/^--?\w/)
const isYallFlag = (arg: string) =>
  yallFlags.indexOf(arg.replace(/^--?/, '')) >= 0

const parseRunArguments = () => {
  const runArgs: string[] = []
  let takeArg = false
  process.argv.forEach((arg, i) => {
    if (isFlag(arg)) {
      takeArg = !isYallFlag(arg)
    }
    takeArg && runArgs.push(arg)
  })
  return runArgs
}

runAll(argv._.concat(parseRunArguments()).join(' '), argv)
