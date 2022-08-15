import * as url from 'node:url'
import * as os from 'node:os'

/////////////////////////////////////
// Benchmark configuration parameters
/////////////////////////////////////

export const benchmarkIterations = 5
export const processIterations = 10
export const workerPoolSize = os.cpus().length - 1

export const filesCount = 1000
export const filesChunkSize = 50

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
