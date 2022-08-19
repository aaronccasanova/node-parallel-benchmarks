import {
  benchmarkIterations,
  processIterations,
  workerPoolSize,
  filesCount,
  filesChunkSize,
  processorURL,
  dataURL,
} from '../config.mjs'

import {
  chunkFiles,
  getElapsedTime,
  getAverageElapsedTime,
} from '../shared/utils.mjs'

const workerPath = new URL('./worker.mjs', import.meta.url).href
const processorPath = processorURL.pathname
const dataPath = dataURL.pathname

const files = Array.from({ length: filesCount }, () => dataPath)
const chunkedFiles = chunkFiles(files, filesChunkSize)

async function run() {
  let chunk = 0
  const next = () => chunkedFiles[chunk++] ?? null

  const workers = []

  for (let i = 0; i < workerPoolSize; i++) {
    workers.push(new Worker(workerPath, { type: 'module' }))
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

          worker.addEventListener('error', reject)

          worker.addEventListener('message', (e) => {
            // message.action | message.results
            // console.log('message.results:', e.data.results)
            const filePaths = next()

            if (filePaths) {
              worker.postMessage({ action: 'process', filePaths })
            } else {
              worker.terminate()

              resolve('Processed files')
            }
          })
        }),
    ),
  )
}

console.log(
  `deno web workers benchmark: Processing ${filesCount} files with ${workerPoolSize} workers\n`,
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
