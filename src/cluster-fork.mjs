import * as fs from 'node:fs'

const processorPath = process.argv[2]
const processIterations = parseInt(process.argv[3])

const { default: processor } = await import(processorPath)

process.on('message', async (message) => {
  if (message.action === 'exit') process.exit()

  if (!processor) throw new Error('No processor loaded')

  const results = await Promise.all(
    message.filePaths.map(async (filePath) => {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8')

      const result = await processor({
        fileContent,
        filePath,
        processIterations,
      })

      return result
    }),
  )

  process.send({ action: 'processed', results })
})

process.send({ action: 'ready' })
