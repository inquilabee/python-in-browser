import { asyncRun } from "./py-worker.js";

// Console Output Redirection: https://stackoverflow.com/questions/56583696/how-to-redirect-render-pyodide-output-in-browser

// Set stdout 
let python_start_code = `
import sys
import io
sys.stdout = io.StringIO()
`


async function main(script, context={}) {
  try {

    console.log("Running code", script)

    const { results, error } = await asyncRun(script, context);

    console.log("result", results)

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

const py_script = `
for i in range(20):
    print(i)

print("hello, world")

import numpy as np

np.mean([1, 2, 3, 4])
`;

const py_context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};


main(py_script, py_context);