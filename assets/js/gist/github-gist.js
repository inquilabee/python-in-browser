import { asyncRun } from "../pyodide/workers/py-worker.js";

function createCodeMirrorEditor(element, data, readonly) {
  return CodeMirror(element, {
    lineNumbers: true,
    tabSize: 4,
    mode: 'python',
    value: data,
    theme: 'dracula',
    keyMap: 'sublime',
    readOnly: readonly
  });
}

function initializeGistElement(gistElement) {
  const gistLink = gistElement.attr("data-gist-src");
  const readonly = gistElement.attr("data-editable") === "false";
  const runnable = gistElement.attr("data-runnable") === "true";
  
  const rawGistCodeLink = gistLink.replace(".js", "/raw/").replace("gist.github.com", "gist.githubusercontent.com");

  const codeBox = $("<div class='code-box'></div>");
  const outputBox = $("<div class='code-output-box'></div>");
  const runButton = $("<button class='code-run-btn'>Run</button>");
  const clearButton = $("<button class='code-clear-btn'>Clear</button>");
  const copyButton = $("<button class='code-copy-btn'>Copy</button>");

  gistElement.append(codeBox, outputBox, runButton, clearButton, copyButton);

  $.get(
    rawGistCodeLink,
    data => {
      const editor = createCodeMirrorEditor(gistElement[0].querySelector(".code-box"), data, readonly);

      const codeRunner = async () => {
        const pythonCode = editor.getValue();
        const { results, error } = await asyncRun(pythonCode);

        if (error) {
          outputBox.text(error);
        } else {
          outputBox.text(results);
        }
      };

      runButton.click(codeRunner);
      clearButton.click(() => {
        editor.setValue('');
        outputBox.text('');
      });
      copyButton.click(() => {
        const textToCopy = editor.getValue();
        copyButton.prop('disabled', true);

        navigator.clipboard.writeText(textToCopy)
          .then(() => copyButton.prop('disabled', false))
          .catch(err => {
            console.error('Unable to copy text to clipboard', err);
            copyButton.prop('disabled', false);
          });
      });
    }
  );
}

$(".github-gist").each((index, gistElement) => {
  initializeGistElement($(gistElement));
});
