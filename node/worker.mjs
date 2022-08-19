import * as fs from 'node:fs'
import * as wt from 'node:worker_threads'

let processor
let processIterations

wt.parentPort.on('message', async (message) => {
  if (message.action === 'load') {
    const mod = await import(message.processorPath)

    processor = mod.default
    processIterations = message.processIterations

    wt.parentPort.postMessage({ action: 'loaded' })
    return
  }

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
