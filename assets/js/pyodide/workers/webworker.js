// webworker.js

importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

// Main code: https://pyodide.org/en/stable/usage/webworker.html
// Console Output Redirection: https://stackoverflow.com/questions/56583696/how-to-redirect-render-pyodide-output-in-browser
// https://github.com/pyodide/pyodide/issues/8#issuecomment-772024841

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();

  await self.pyodide.loadPackage(["numpy", "pytz"]);
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;

  const { id, python, ...context } = event.data;

  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }

  try {
    await self.pyodide.loadPackagesFromImports(python);

    let results = await self.pyodide.runPythonAsync(python);

    self.postMessage({ results, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};