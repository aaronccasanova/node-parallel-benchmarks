let processor
let processIterations

self.onmessage = async (e) => {
  if (e.data.action === 'load') {
    const mod = await import(e.data.processorPath)

    processor = mod.default
    processIterations = e.data.processIterations

    self.postMessage({ action: 'loaded' })
    return
  }

  const results = await Promise.all(
    e.data.filePaths.map(async (filePath) => {
      const fileContent = await Deno.readTextFile(filePath)

      const result = await processor({
        filePath,
        fileContent,
        processIterations,
      })

      return result
    }),
  )

  self.postMessage({ action: 'processed', results })
}
