import { asyncRun } from "../pyodide/workers/py-worker.js";

$(".github-gist").each(function (i, e) { 
    let gist_link = $(e).attr("data-gist-src")
    let readonly = $(e).attr("data-editable") === "false"
    let runnable = $(e).attr("data-runnable") === "true" 

    let raw_gist_code_link = gist_link.replace(".js", "/raw/").replace("gist.github.com", "gist.githubusercontent.com")

    let code_box = $("<div class='code-box'> </div>") 
    let output_box = $("<div class='code-output-box'> </div>") 
    let code_run_button = $("<button class='code-run-btn'> </button>") 
    
    $(e).append(code_box)
    $(e).append(output_box)
    $(e).append(code_run_button)
    
    // console.log(raw_gist_code_link)

    $.get(
            raw_gist_code_link, 
            data => {
                        // console.log(data)
                        // use vanilla JS to select element below
                        const editor = CodeMirror(e.querySelector(".code-box"), {
                            lineNumbers: true,
                            tabSize: 4,
                            mode: 'python',
                            value: data,
                            theme: 'dracula',
                            readOnly: readonly
                        });

                        async function codeRunner() {
                                let python_code = editor.getValue();

                                console.log(python_code)

                                const { results, error } = await asyncRun(python_code);
                                
                                if (results) {
                                        output_box.text(results)
                                }
                                else if (error) {
                                        output_box.text(error)
                                } else {
                                        output_box.text("Something went horribly wrong!")  
                                }                                
                        }

                        $(e).find(".code-run-btn:first").click(codeRunner);
                }
        )
})