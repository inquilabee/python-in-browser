const pyodideWorker = new Worker("./assets/js/pyodide/webworker.js");

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {

  return (script, context) => {
    const id = Date.now().toString(); // Unique identifier for each run

    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python:  script,
        id,
      });
    });
  };
})();

export { asyncRun };