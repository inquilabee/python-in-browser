import { asyncRun } from "./py-worker.js";


$(".github-gist").each(function (i, e) { 
    let gist_link = $(e).attr("data-gist-src")

    let raw_gist_code_link = gist_link.replace(".js", "/raw/").replace("gist.github.com", "gist.githubusercontent.com")

    let code_box = $("<div class='code-box'> </div>") 
    let output_box = $("<div id='code-box-output'> </div>") 
    let run_button = $("<button class='run-code'> Run </button>")
    let clear_button = $("<button class='clear-code'> Clear </button>")

    $(e).append(code_box)
    $(e).append(output_box)
    $(e).append(run_button)
    $(e).append(clear_button)

    $.get(
            raw_gist_code_link, 
            data => {
                        
                // use vanilla JS to select element below
                let editor = CodeMirror(e.querySelector(".code-box"), {
                    lineNumbers: true,
                    tabSize: 4,
                    mode: 'python',
                    value: data,
                    theme: 'dracula' // 'oceanic-next'
                });

                $(e).find(".run-code:first").click(
                    async function() {
                        // let current_code = editor.getValue();
                        let current_code = "print('Hello, world')";
                        
                        let result = await asyncRun(current_code)
                        
                        console.log(current_code)
                        console.log("Output", result)

                        // output_box.innerText = result
                    }
                )
            }
        )
})