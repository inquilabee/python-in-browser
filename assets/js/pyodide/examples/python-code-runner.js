// test script 
// do not use elsewhere

import { asyncRun } from "../workers/py-worker.js";


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

function prepare_code(python_code) {
  return `
import sys, io, traceback
namespace = {}  # use separate namespace to hide run_code, modules, etc.

def run_code():
    """run specified code and return stdout and stderr"""
    out = io.StringIO()
    oldout = sys.stdout
    olderr = sys.stderr
    sys.stdout = sys.stderr = out

    code = f"""${python_code}"""

    try:
        # change next line to exec(code, {}) if you want to clear vars each time
        exec(code, namespace)
    except:
        traceback.print_exc()

    sys.stdout = oldout
    sys.stderr = olderr
    return out.getvalue()

run_code()
`
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

if __name__ == "__main__":
    print("Hello" * 20)
`

const py_context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};


run_code(prepare_code(py_script_1), py_context); //works
run_code(prepare_code(py_script_1), py_context); // workks
run_code(py_script_2, py_context); // works
// run_code(prepare_code(py_script_2), py_context); // does not run