export default function processor(options) {
  const { fileContent, processIterations } = options

  const result = {}

  for (let i = 0; i < processIterations; i++) {
    for (const char of fileContent) {
      result[char] = (result[char] ?? 0) + 1
    }
  }

  return result
}
