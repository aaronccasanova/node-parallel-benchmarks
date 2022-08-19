import * as wt from 'node:worker_threads'
import * as url from 'node:url'
import { performance } from 'node:perf_hooks'

import {
  benchmarkIterations,
  processIterations,
  workerPoolSize,
  filesCount,
  filesChunkSize,
  dataURL,
  processorURL,
} from '../config.mjs'

import {
  chunkFiles,
  getElapsedTime,
  getAverageElapsedTime,
} from '../shared/utils.mjs'

const workerPath = url.fileURLToPath(new URL('./worker.mjs', import.meta.url))
const processorPath = url.fileURLToPath(processorURL)
const dataPath = url.fileURLToPath(dataURL)

const files = Array.from({ length: filesCount }, () => dataPath)
const chunkedFiles = chunkFiles(files, filesChunkSize)

async function run() {
  let chunk = 0
  const next = () => chunkedFiles[chunk++] ?? null

  const workers = []

  for (let i = 0; i < workerPoolSize; i++) {
    workers.push(new wt.Worker(workerPath))
  }

  await Promise.all(
    workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
          worker.postMessage({
            action: 'load',
            processorPath,
            processIterations,
          })

          worker.on('error', reject)

          worker.on('message', (message) => {
            // message.action | message.results
            // console.log('message.results:', message.results)
            const filePaths = next()

            if (filePaths) {
              worker.postMessage({ action: 'process', filePaths })
            } else {
              worker.unref()

              resolve('Processed files')
            }
          })
        }),
    ),
  )
}

console.log(
  `node:worker_threads benchmark: Processing ${filesCount} files with ${workerPoolSize} workers\n`,
)

const runTimes = []
const benchmarkStartTime = performance.now()

for (let i = 0; i < benchmarkIterations; i++) {
  const runStartTime = performance.now()

  await run()

  runTimes.push([runStartTime, performance.now()])
}

const benchmarkElapsedTime = getElapsedTime([
  benchmarkStartTime,
  performance.now(),
])

const averageElapsedTime = getAverageElapsedTime(runTimes)

console.log(`Average time to process ${filesCount} files: `, averageElapsedTime)
console.log('Benchmark elapsed time: ', benchmarkElapsedTime, '\n\n')
