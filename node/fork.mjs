import * as fs from 'node:fs'

let processor
let processIterations

process.on('message', async (message) => {
  if (message.action === 'load') {
    const mod = await import(message.processorPath)

    processor = mod.default
    processIterations = message.processIterations

    process.send({ action: 'loaded' })
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

  process.send({ action: 'processed', results })
})
