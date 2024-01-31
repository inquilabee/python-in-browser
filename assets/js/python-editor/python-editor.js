import { asyncRun } from '../pyodide/workers/py-worker.js'

import { formatPython } from '../utils/py-format.js'

// Console messages

const CODE_RUNNING_MESSAGE = '[Started running code]<hr>'
const CODE_FINISHED_MESSAGE = '<hr>[Finished running code]'
const CODE_ERROR_MESSAGE = 'Error during code execution. Check console for details.'

// text colors for messages

const CODE_START_END_MESSAGE_COLOR = 'white'
const CODE_ERROR_TEXT_COLOR = 'red'

const formatMessage = (message, color) => `<span style="color:${color}">${message}</span>`

const editor_template_code = `
<template id="python-code-editor-template">

<!-- Code Editor -->
<div class="code-editor mt-4">
  <div class="columns is-multiline">

    <!-- Code Box -->
    <div class="column is-two-third" >
      <div id="columns">
        <div class="column coding-box">
          <div class="code-title">
            Python <i class="fa-brands fa-python"></i>
          </div> 
          <div class="code-content">
            <div class="codemirror-box"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Code Box -->
    
    <!-- Output Box (Terminal Style) -->
    <div class="column is-one-third" >
      <div id="columns">
        <div class="column output-box">
          <div class="code-output-title">
            Output Terminal
          </div> 
          <div class="code-output-content">
            
          </div>
        </div>
      </div>
    </div>
    <!-- Output Box (Terminal Style) Ends -->
    
    <!-- Action Buttons -->
    <div class="column is-full mt-2">
      <div class="field is-grouped">
        <p class="control">
          <button class="editor-play-button button is-normal is-responsive">
            <i class="fa-solid fa-play" style="color: #63E6BE;"></i>
          </button>
        </p>
        <p class="control">
          <button class="editor-copy-button button is-normal is-responsive">
            <i class="fa-solid fa-clipboard" style="color: #74C0FC;"></i>
          </button>
        </p>
        <p class="control">
          <button class="editor-clear-button button is-normal is-responsive">
            <i class="fa-solid fa-arrows-rotate" style="color: #2051a7;"></i>
          </button>
        </p>
      </div>
    </div>
    <!-- Action Buttons Ends -->
  </div>  
</div>
<!-- Code Editor -->
</template>`

const initializeCodeMirror = (element, initialValue) => {
    // Function to initialize CodeMirror for an element
    const editor = CodeMirror(element, {
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        mode: 'python',
        value: initialValue || "print('Hello, Python')",
        theme: 'dracula',
        keyMap: 'sublime',
        readOnly: false,
        lineWrapping: true,
        indentWithTabs: true,
    })

    const outputBox = $(element).closest('.code-editor').find('.output-box .code-output-content')

    const runButton = $(element).closest('.code-editor').find('.editor-play-button')

    const copyButton = $(element).closest('.code-editor').find('.editor-copy-button')

    const clearButton = $(element).closest('.code-editor').find('.editor-clear-button')

    return {
        editor,
        outputBox,
        runButton,
        copyButton,
        clearButton,
    }
};

const applyRunButton = (runButton, editor, outputBox) => {
    // Function to apply on runButton
    runButton.on('click', async () => {
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
      })
};

const applyCopyButton = (copyButton, editor) => {
    // Function to apply on copyButton

    copyButton.on('click', () => {
        const code = editor.getValue()
        copyButton.prop('disabled', true)

        navigator.clipboard
            .writeText(code)
            .then(() => copyButton.prop('disabled', false))
            .catch((err) => {
                console.error('Unable to copy text to clipboard', err)
                copyButton.prop('disabled', false)
            })
    })
};

const applyClearButton = (clearButton, editor, outputBox) => {
    // Function to apply on clearButton
    clearButton.on('click', () => {
        editor.setValue('')
        outputBox.text('')
    })
};

const getGistCode = async gistLink => {
    function trimFromEnd(str, suffix) {
        const regex = new RegExp(`${suffix}$`)
        return str.replace(regex, '')
    }

    const rawGistCodeLink = gistLink
        ? `${trimFromEnd(gistLink, '.js')}/raw/`.replace('gist.github.com', 'gist.githubusercontent.com')
        : null

    if (!rawGistCodeLink) {
        return ''
    }

    try {
        const response = await fetch(rawGistCodeLink)

        if (!response.ok) {
            throw new Error(`Failed to fetch Gist code. Status: ${response.status}`)
        }

        return await response.text()
    } catch (error) {
        console.error('Error fetching Gist code:', error)
        return ''
    }
};

$(document).ready(async () => {
    const editor_template = $(editor_template_code)

    // Select all elements with the class "python-editor"
    const requested_editors = $('.python-editor')

    requested_editors.each(async (_index, box) => {
        const box_content = $(box).text()

        $(box).html('')

        $(box).append(editor_template.html())

        const gistLink = $(box).attr('data-gist-src')

        // console.log(gistLink)

        const initialCode =
            box_content !== undefined && box_content !== null && $.trim(box_content) !== ''
                ? formatPython(box_content)
                : (await getGistCode(gistLink)) || ''

        // console.log(initialCode)

        const { editor, outputBox, runButton, copyButton, clearButton } = initializeCodeMirror(
            $(box).find('.codemirror-box')[0],
            initialCode
        )

        // Apply functions on buttons
        applyRunButton(runButton, editor, outputBox)
        applyCopyButton(copyButton, editor)
        applyClearButton(clearButton, editor, outputBox)
    })
})
