export function chunkFiles(files, chunkSize) {
  const chunkedFiles = []

  for (let i = 0; i < files.length; i += chunkSize) {
    chunkedFiles.push(files.slice(i, i + chunkSize))
  }

  return chunkedFiles
}

export function getElapsedTime([startTime, endTime]) {
  return parseFloat((endTime - startTime) / 1000)
}

export function getAverageElapsedTime(times) {
  const elapsedTimes = times.map((time) => getElapsedTime(time))

  return elapsedTimes.reduce((a, b) => a + b, 0) / elapsedTimes.length
}
