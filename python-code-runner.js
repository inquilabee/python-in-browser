// test script 
// do not use elsewhere

import { asyncRun } from "./py-worker.js";


async function run_code(script, context={}) {
  try {

    // console.log("Running code", script)

    const { results, error } = await asyncRun(script, context);

    if (results) {
      console.log("pyodideWorker return results: ", results);
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
    );
  }
}

let py_script = `
import js

for i in range(5):
    print(i)

print("hello, world")

import numpy as np

print(np.mean(js.A_rank))
`

const py_context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};


run_code(py_script, py_context);