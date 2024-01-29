// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.json`,
// and `.wasm` files as well:

importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

// Main code: https://pyodide.org/en/stable/usage/webworker.html
// Console Output Redirection: https://stackoverflow.com/questions/56583696/how-to-redirect-render-pyodide-output-in-browser
// https://github.com/pyodide/pyodide/issues/8#issuecomment-772024841

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();

  await self.pyodide.loadPackage(["numpy", "pytz"]);
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

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;

  // Don't bother yet with this line, suppose our API is built in such a way:
  const { id, python, ...context } = event.data;

  // The worker copies the context in its own "memory" (an object mapping name to values)
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  // Now is the easy part, the one that is similar to working in the main thread:
  try {
    await self.pyodide.loadPackagesFromImports(python);

    let results = await self.pyodide.runPythonAsync(prepare_code(python));

    self.postMessage({ results, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};