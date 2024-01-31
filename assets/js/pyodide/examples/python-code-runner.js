// test script
// do not use elsewhere

import { asyncRun } from '../workers/py-worker.js'

async function run_code(script, context = {}) {
    try {
        // console.log("Running code", script)

        const { results, error } = await asyncRun(script, context)

        if (results) {
            console.log('pyodideWorker return results: ', results)
        } else if (error) {
            console.log('pyodideWorker error: ', error)
        }
    } catch (e) {
        console.log(`Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`)
    }
}

let py_script_1 = `
import js

for i in range(5):
    print(i)

print("hello, world")

import numpy as np

print(np.mean(js.A_rank))
`

let py_script_2 = `
import js

for i in range(5):
    print(f"i={i}")

print("hello, world")

import numpy as np

print(np.mean(js.A_rank))

print(__name__)

if __name__ == "__main__":
    print("Hello" * 20)
`

const py_context = {
    A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
}

run_code(py_script_2, py_context)
run_code(py_script_1, py_context)
