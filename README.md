# Node parallel benchmarks

Playground for benchmarking Node.js APIs for parallel processing.

> Note: This collection of benchmarks is scoped to comparing the speed of parallel processing a large number of text files. Example applications are linting, static analysis, code transformation, etc.

Each `run-<script>.mjs` performs the following operations:

- Creates a pool of workers
- Passes a chunk of file paths to each worker
  - Each worker performs the following operations:
    - Promise.all over each file path:
      - Reads the file content
      - Passes the file content to the `processor.mjs` script (representative of a generic function to perform any of the example applications listed above)
      - Each processor script performs the following operations:
        - Iterates over each character in the file content
        - Computes the frequency of each character
        - Returns the results back to the worker
    - Returns the results back to the main thread
    - Receives another chunk of file paths from the main thread and repeats the above steps
- Terminates each worker when there are no more file paths to process

## Usage

```sh
git clone https://github.com/aaronccasanova/node-parallel-benchmarks.git
```

```sh
npm run workers-vs-forks
```

## How to adjust the benchmark parameters?

Open the `src/config.mjs` file and update the following constants:

| Parameter | Description |
| --- | --- |
| `workerPoolSize` | The number of workers to use |
| `benchmarkIterations` | The number of times to run the benchmark for a given Node API |
| `processIterations` | The number of times `processor.mjs` iterates over `data.tsx`. Use this parameter to adjust how long a single file takes to process |
| `filesCount` | The number of files to process |
| `filesChunkSize` | The number of files a `worker.mjs` instance will process at a time |

## References

- [Node.js `WPTRunner`](https://github.com/nodejs/node/blob/d6e626d54cda57b28e72b2c5c84a5be8aff361a2/test/common/wpt.js#L426-L474)
- [Facebook `jscodeshift`](https://github.com/facebook/jscodeshift/blob/8d0bf44ac29bcde9b7cbc437f7554269a6204c31/src/Runner.js#L257-L287)
