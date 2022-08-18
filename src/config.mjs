import * as url from 'node:url'
import * as os from 'node:os'
import * as util from 'node:util'

/////////////////////////////////////
// Benchmark configuration parameters
/////////////////////////////////////

const cli = util.parseArgs({
  options: {
    'benchmark-iterations': { short: 'b', type: 'string' },
    'process-iterations': { short: 'p', type: 'string' },
    'worker-pool-size': { short: 'w', type: 'string' },
    'files-count': { short: 'f', type: 'string' },
    'files-chunk-size': { short: 'c', type: 'string' },
  },
})

export const benchmarkIterations = Number(
  cli.values['benchmark-iterations'] ?? 5,
)
export const processIterations = Number(cli.values['process-iterations'] ?? 10)
export const workerPoolSize = Number(
  cli.values['worker-pool-size'] ?? os.cpus().length - 1,
)

export const filesCount = Number(cli.values['files-count'] ?? 1000)
export const filesChunkSize = Number(cli.values['files-chunk-size'] ?? 50)

////////////////////////////////////
// Benchmark constants and utilities
////////////////////////////////////

export const workerPath = getPath('./worker.mjs')
export const forkPath = getPath('./fork.mjs')
export const processorPath = getPath('./processor.mjs')
export const dataPath = getPath('./data.txt')

export const workerOptions = {
  workerData: { processorPath, processIterations },
}

export const files = Array.from({ length: filesCount }, () => dataPath)
export const chunkedFiles = chunkFiles(files, filesChunkSize)

function chunkFiles(files, chunkSize) {
  const chunkedFiles = []

  for (let i = 0; i < files.length; i += chunkSize) {
    chunkedFiles.push(files.slice(i, i + chunkSize))
  }

  return chunkedFiles
}

function getPath(path) {
  return url.fileURLToPath(new URL(path, import.meta.url))
}

export function getElapsedTime(endTime) {
  return parseFloat((endTime[0] + endTime[1] / 1e9).toFixed(3))
}

export function getAverageElapsedTime(endTimes) {
  const elapsedTimes = endTimes.map((endTime) => getElapsedTime(endTime))

  return elapsedTimes.reduce((a, b) => a + b, 0) / elapsedTimes.length
}
