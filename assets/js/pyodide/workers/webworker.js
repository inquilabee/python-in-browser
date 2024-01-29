// webworker.js

importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

// Main code: https://pyodide.org/en/stable/usage/webworker.html
// Console Output Redirection: https://stackoverflow.com/questions/56583696/how-to-redirect-render-pyodide-output-in-browser
// https://github.com/pyodide/pyodide/issues/8#issuecomment-772024841


function setup_pyodide() {
  // setup pyodide environment to run code blocks as needed
  var setup_code = `
import sys, io, traceback
namespace = {}  # use separate namespace to hide run_code, modules, etc.
def run_code(code):
    """run specified code and return stdout and stderr"""
    out = io.StringIO()
    oldout = sys.stdout
    olderr = sys.stderr
    sys.stdout = sys.stderr = out
    try:
        # change next line to exec(code, {}) if you want to clear vars each time
        exec(code, namespace)
    except:
        traceback.print_exc()

    sys.stdout = oldout
    sys.stderr = olderr
    return out.getvalue()
`
  self.pyodide.runPython(setup_code)
}

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();

  await self.pyodide.loadPackage(["numpy", "pytz"]);

  setup_pyodide()
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;

  const { id, python, ...context } = event.data;

  Object.assign(self, context);

  try {
    await self.pyodide.loadPackagesFromImports(python);

    const random_var = `code_to_run_${Math.floor(Math.random() * 1000000)}`

    // console.log(random_var)

    self.pyodide.globals.set(random_var, python)
    let results = await self.pyodide.runPythonAsync(`run_code(${random_var})`);
    
    self.postMessage({ results, id });
    // below causes weird errors: Why? ;'(
    // delete self.pyodide.globals[random_var]

    // Try this later, let it be for now
    // setTimeout(() => {
    //   // Delete the variable from globals after a short delay
    //   delete self.pyodide.globals[random_var];
    // }, 5000);
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};