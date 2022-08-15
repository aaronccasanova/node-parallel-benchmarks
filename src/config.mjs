// node benchmarks/run-workers.mjs && node benchmarks/run-forks.mjs

import * as url from 'node:url'

export const benchmarkIterations = 5
export const processIterations = 10
export const workerPoolSize = 7

export const filesCount = 1000
export const filesChunkSize = 50

export const workerPath = getPath('./worker.mjs')
export const cpForkPath = getPath('./cp-fork.mjs')
export const clusterForkPath = getPath('./cluster-fork.mjs')
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
