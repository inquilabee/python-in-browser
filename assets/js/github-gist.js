import { asyncRun } from "../../py-worker.js";

$(".github-gist").each(function (i, e) { 
    let gist_link = $(e).attr("data-gist-src")

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
                            readOnly: false
                        });

                        async function codeRunner() {
                                let python_code = editor.getValue();

                                console.log(python_code)

                                const { results, error } = await asyncRun(python_code);

                                output_box.text(results)
                                
                                // console.log("Output:")
                                // console.log(results)
                        }

                        $(e).find(".code-run-btn:first").click(codeRunner);
                }
        )
})