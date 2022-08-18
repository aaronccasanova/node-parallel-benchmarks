import * as cp from 'node:child_process'

import {
  benchmarkIterations,
  workerPoolSize,
  forkPath,
  workerOptions,
  chunkedFiles,
  filesCount,
  getElapsedTime,
  getAverageElapsedTime,
} from './src/config.mjs'

async function run() {
  let chunk = 0
  const next = () => chunkedFiles[chunk++] ?? null

  const workers = []

  for (let i = 0; i < workerPoolSize; i++) {
    workers.push(
      cp.fork(forkPath, [
        workerOptions.workerData.processorPath,
        workerOptions.workerData.processIterations.toString(),
      ]),
    )
  }

  await Promise.all(
    workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
          worker.send({ action: 'process', filePaths: next() })

          worker.on('error', reject)
          worker.on('exit', (code) =>
            code !== 0
              ? reject(new Error('Failed to process files'))
              : resolve('Processed files'),
          )

          worker.on('message', (message) => {
            // message.action | message.results
            // console.log('message.results:', message.results)
            const filePaths = next()

            if (filePaths) {
              worker.send({ action: 'process', filePaths })
            } else {
              worker.send({ action: 'exit' })
            }
          })
        }),
    ),
  )
}

console.log(
  `Forks benchmark: Processing ${filesCount} files with ${workerPoolSize} forks\n`,
)

const runEndTimes = []
const benchmarkStartTime = process.hrtime()

for (let i = 0; i < benchmarkIterations; i++) {
  const runStartTime = process.hrtime()

  await run()

  runEndTimes.push(process.hrtime(runStartTime))
}

const benchmarkElapsedTime = getElapsedTime(process.hrtime(benchmarkStartTime))
const averageElapsedTime = getAverageElapsedTime(runEndTimes)

console.log(`Average time to process ${filesCount} files: `, averageElapsedTime)
console.log('Benchmark elapsed time: ', benchmarkElapsedTime, '\n\n')
