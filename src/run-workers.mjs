import * as wt from 'node:worker_threads'

import {
  benchmarkIterations,
  workerPoolSize,
  workerPath,
  workerOptions,
  chunkedFiles,
  filesCount,
  getElapsedTime,
} from './config.mjs'

async function run() {
  let chunk = 0
  const next = () => chunkedFiles[chunk++] ?? null

  const startTime = process.hrtime()

  const workers = []

  for (let i = 0; i < workerPoolSize; i++) {
    workers.push(new wt.Worker(workerPath, workerOptions))
  }

  await Promise.all(
    workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
          worker.postMessage({ action: 'process', filePaths: next() })

          worker.on('error', reject)
          worker.on('exit', (code) =>
            code !== 0
              ? reject(new Error('Failed to process file'))
              : resolve('Processed file'),
          )

          worker.on('message', (_message) => {
            // _message.action | _message.results
            // console.log('_message.results:', _message.results)
            const filePaths = next()

            if (filePaths) {
              worker.postMessage({ action: 'process', filePaths })
            } else {
              worker.postMessage({ action: 'exit' })
            }
          })
        }),
    ),
  )

  return process.hrtime(startTime)
}

const endTimes = []

console.log(
  `Workers benchmark: Processing ${filesCount} files with ${workerPoolSize} workers\n`,
)

const benchmarkStart = process.hrtime()

for (let i = 0; i < benchmarkIterations; i++) {
  const endTime = await run()

  endTimes.push(endTime)
}

const benchMarkEnd = process.hrtime(benchmarkStart)
const benchmarkElapsedTime = getElapsedTime(benchMarkEnd)

const elapsedTimes = endTimes.map((endTime) => getElapsedTime(endTime))
const averageElapsedTime =
  elapsedTimes.reduce((a, b) => a + b) / elapsedTimes.length

console.log(`Average time to process ${filesCount} files: `, averageElapsedTime)
console.log('Benchmark elapsed time: ', benchmarkElapsedTime, '\n\n')
