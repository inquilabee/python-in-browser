import { asyncRun } from '../pyodide/workers/py-worker.js'
import { formatPython } from '../utils/py-format.js'

// button classes

const CODE_BOX_CLASS = 'code-box'
const CODE_OUTPUT_BOX_CLASS = 'code-output-box'
const CODE_RUN_BTN_CLASS = 'code-run-btn'
const CODE_CLEAR_BTN_CLASS = 'code-clear-btn'
const CODE_COPY_BTN_CLASS = 'code-copy-btn'

// Console messages

const CODE_RUNNING_MESSAGE = '[Started running code]<hr>'
const CODE_FINISHED_MESSAGE = '<hr>[Finished running code]'
const CODE_ERROR_MESSAGE = 'Error during code execution. Check console for details.'

// text colors for messages

const CODE_START_END_MESSAGE_COLOR = 'white'
const CODE_ERROR_TEXT_COLOR = 'red'

const formatMessage = (message, color) => `<span style="color:${color}">${message}</span>`

function createCodeMirrorEditor(element, data, readonly) {
    return CodeMirror(element, {
        lineNumbers: true,
        tabSize: 4,
        mode: 'python',
        value: data,
        theme: 'dracula',
        keyMap: 'sublime',
        readOnly: readonly,
    })
}

function initializeCodeBlock(codeBlockElement) {
    const readonly = codeBlockElement.attr('data-editable') === 'false'

    // maintain formatting of original text content
    // const initialCode = codeBlockElement[0].innerText.trim().replace(/\r\n|\r|\n/g, '\n');
    const initialCode = formatPython(codeBlockElement.text())

    // console.log(initialCode)

    const codeBox = $(`<div class='${CODE_BOX_CLASS}'></div>`)
    const outputBox = $(`<div class='${CODE_OUTPUT_BOX_CLASS}'></div>`)
    const runButton = $(`<button class='${CODE_RUN_BTN_CLASS}'>Run</button>`)
    const clearButton = $(`<button class='${CODE_CLEAR_BTN_CLASS}'>Clear</button>`)
    const copyButton = $(`<button class='${CODE_COPY_BTN_CLASS}'>Copy</button>`)

    codeBlockElement.html('').append(codeBox, outputBox, runButton, clearButton, copyButton)

    const editor = createCodeMirrorEditor(codeBlockElement.find(`.${CODE_BOX_CLASS}`).get(0), initialCode, readonly)
    attachButtonHandlers(editor, outputBox, runButton, clearButton, copyButton)
}

function initializeGistElement(gistElement) {
    const gistLink = gistElement.attr('data-gist-src')
    const readonly = gistElement.attr('data-editable') === 'false'
    const rawGistCodeLink = gistLink
        ? gistLink.replace('.js', '/raw/').replace('gist.github.com', 'gist.githubusercontent.com')
        : null

    const codeBox = $(`<div class='${CODE_BOX_CLASS}'></div>`)
    const outputBox = $(`<div class='${CODE_OUTPUT_BOX_CLASS}'></div>`)
    const runButton = $(`<button class='${CODE_RUN_BTN_CLASS}'>Run</button>`)
    const clearButton = $(`<button class='${CODE_CLEAR_BTN_CLASS}'>Clear</button>`)
    const copyButton = $(`<button class='${CODE_COPY_BTN_CLASS}'>Copy</button>`)

    if (rawGistCodeLink) {
        gistElement.append(codeBox, outputBox, runButton, clearButton, copyButton)

        $.get(rawGistCodeLink, (data) => {
            const editor = createCodeMirrorEditor(gistElement.find(`.${CODE_BOX_CLASS}`).get(0), data, readonly)
            attachButtonHandlers(editor, outputBox, runButton, clearButton, copyButton)
        })
    }
}

function attachButtonHandlers(editor, outputBox, runButton, clearButton, copyButton) {
    const codeRunner = async () => {
        const pythonCode = editor.getValue()

        try {
            outputBox.text('')
            outputBox.append(formatMessage(CODE_RUNNING_MESSAGE, CODE_START_END_MESSAGE_COLOR))

            const { results, error } = await asyncRun(pythonCode)

            if (error) {
                outputBox.append(formatMessage(CODE_ERROR_MESSAGE, CODE_ERROR_TEXT_COLOR))
            } else {
                outputBox.append(results)
            }
        } catch (error) {
            console.error('Error during code execution:', error)
            outputBox.append(formatMessage(CODE_ERROR_MESSAGE, CODE_ERROR_TEXT_COLOR))
        } finally {
            outputBox.append(formatMessage(CODE_FINISHED_MESSAGE, CODE_START_END_MESSAGE_COLOR))
        }
    }

    runButton.click(codeRunner)
    clearButton.click(() => {
        editor.setValue('')
        outputBox.text('')
    })
    copyButton.click(() => {
        const textToCopy = editor.getValue()
        copyButton.prop('disabled', true)

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => copyButton.prop('disabled', false))
            .catch((err) => {
                console.error('Unable to copy text to clipboard', err)
                copyButton.prop('disabled', false)
            })
    })
}

$('.github-gist').each((index, gistElement) => {
    initializeGistElement($(gistElement))
})

$('.code-block').each((index, codeElement) => {
    initializeCodeBlock($(codeElement))
})
