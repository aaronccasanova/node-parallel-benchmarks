import * as fs from 'node:fs'
import * as wt from 'node:worker_threads'

const processorPath = wt.workerData.processorPath
const processIterations = wt.workerData.processIterations

const { default: processor } = await import(processorPath)

wt.parentPort.on('message', async (message) => {
  if (message.action === 'exit') process.exit()

  const results = await Promise.all(
    message.filePaths.map(async (filePath) => {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8')

      const result = await processor({
        filePath,
        fileContent,
        processIterations,
      })

      return result
    }),
  )

  wt.parentPort.postMessage({ action: 'processed', results })
})
