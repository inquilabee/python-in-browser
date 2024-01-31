# Code Editor with Python Support

This is a feature-rich web-based code editor with Python language support. It includes features such as executing Python code using Web Workers, FontAwesome icons, support for multiple editor instances, and a guide on how to run a simple Python server for testing purposes.

## Features

- Python code editor with syntax highlighting.
- Execute Python code using Web Workers for parallel processing.
- Display the output in a terminal-like interface.
- Copy code to the clipboard.
- Clear the editor.
- FontAwesome icons for a visually appealing interface.
- Support for multiple editor instances.
- Customize the editor with simple/blank Python code, custom code, or a Gist link.

## Usage

1. Include the necessary libraries and styles
    CDN for Font Awesome, CodeMirror, JQuery and other libraries. See `python-editor.html` for reference. 


2. Create a container for the Python editor:

   ```html
   <!-- Simple/blank Python editor -->
   <div class="python-editor"></div>

   <!-- Editor with custom code -->
   <div class="python-editor" data-initial-code="print('Custom Python Code')"></div>

   <!-- Editor with Gist link -->
   <div class="python-editor" data-gist-src="https://gist.github.com/example-gist.js"></div>
   ```

3. Run a simple Python server for testing:

   Open a terminal and run the following command:

   ```bash
   python -m http.server
   ```

   This command starts a simple HTTP server on your machine. Open your web browser and navigate to `http://localhost:8000` to test the code editor.

## Dependencies

- FontAwesome (6.5)
- jQuery
- CodeMirror
- Python execution environment (pyodide)

Feel free to customize and extend the functionality according to your needs. Happy coding!