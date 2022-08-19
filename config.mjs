///////////////////////////////
// Default benchmark parameters
///////////////////////////////

export let benchmarkIterations = 5
export let processIterations = 10
export let workerPoolSize = 6

export let filesCount = 3000
export let filesChunkSize = 50

export const dataURL = new URL('./shared/data.txt', import.meta.url)
export const processorURL = new URL('./shared/processor.mjs', import.meta.url)

////////////////////////////////////
// Benchmark parameter CLI overrides
////////////////////////////////////

// Deno CLI overrides
if ('Deno' in globalThis) {
  const { parse } = await import('https://deno.land/std@0.152.0/flags/mod.ts')

  const cli = parse(Deno.args, {
    string: [
      'benchmark-iterations',
      'process-iterations',
      'worker-pool-size',
      'files-count',
      'files-chunk-size',
    ],
    alias: {
      'benchmark-iterations': 'b',
      'process-iterations': 'p',
      'worker-pool-size': 'w',
      'files-count': 'f',
      'files-chunk-size': 'c',
    },
  })

  benchmarkIterations = cli['benchmark-iterations']
    ? Number(cli['benchmark-iterations'])
    : benchmarkIterations

  processIterations = cli['process-iterations']
    ? Number(cli['process-iterations'])
    : processIterations

  workerPoolSize = cli['worker-pool-size']
    ? Number(cli['worker-pool-size'])
    : workerPoolSize

  filesCount = cli['files-count'] ? Number(cli['files-count']) : filesCount

  filesChunkSize = cli['files-chunk-size']
    ? Number(cli['files-chunk-size'])
    : filesChunkSize
} else {
  // Node CLI overrides
  const util = await import('node:util')

  const cli = util.parseArgs({
    options: {
      'benchmark-iterations': { short: 'b', type: 'string' },
      'process-iterations': { short: 'p', type: 'string' },
      'worker-pool-size': { short: 'w', type: 'string' },
      'files-count': { short: 'f', type: 'string' },
      'files-chunk-size': { short: 'c', type: 'string' },
    },
  })

  benchmarkIterations = cli.values['benchmark-iterations']
    ? Number(cli.values['benchmark-iterations'])
    : benchmarkIterations

  processIterations = cli.values['process-iterations']
    ? Number(cli.values['process-iterations'])
    : processIterations

  workerPoolSize = cli.values['worker-pool-size']
    ? Number(cli.values['worker-pool-size'])
    : workerPoolSize

  filesCount = cli.values['files-count']
    ? Number(cli.values['files-count'])
    : filesCount

  filesChunkSize = cli.values['files-chunk-size']
    ? Number(cli.values['files-chunk-size'])
    : filesChunkSize
}
