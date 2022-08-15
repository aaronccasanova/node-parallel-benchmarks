import * as cluster from 'node:cluster'

import {
  benchmarkIterations,
  workerPoolSize,
  clusterForkPath,
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
    cluster.setupPrimary({
      exec: clusterForkPath,
      args: [
        workerOptions.workerData.processorPath,
        workerOptions.workerData.processIterations.toString(),
      ],
    })

    workers.push(cluster.fork())
  }

  await Promise.all(
    workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
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
              worker.send({ action: 'process', filePaths })
            } else {
              worker.send({ action: 'exit' })
            }
          })
        }),
    ),
  )

  return process.hrtime(startTime)
}

const endTimes = []

console.log(
  `Clusters benchmark: Processing ${filesCount} files with ${workerPoolSize} forks\n`,
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
