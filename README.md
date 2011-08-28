Bash Prompt Builder
===========================
[Homepage](http://andrewray.me/bash-prompt-builder/index.html) 

This is a website hosting a configurable function to modify your bash prompt to include DVCS information. Currently supported are Git, Mercurial (hg) and Subversion.

## Modifying the function: 
The entire function is stored in [index.html](https://github.com/DelvarWorld/Bash-Prompt-Builder/blob/master/index.html). If you wish to modify the function please do so in that file. Here's the tricky part: The function is stored in a giant string assigned to the variable `dvcs_function`. This variable is then executed in the PS1 output. This is done because there is no other way to properly escape characters such as color codes and unicode characters without affecting the bash line wrapping. A simple way to test if you've broken bash line wrapping is at the shell, type a long command and execute it. Then type CTRL-R to search for the command to bring it up, then hit CTRL-A CTRL-E to jump to the beginning / end of the line. If the characters get garbled, you broke it.

The function in a string trick came as the direct result of [this](http://stackoverflow.com/questions/6592077/bash-prompt-and-echoing-colors-inside-a-function) StackOverflow question. If you know how to get around this problem, I'm all ears.

If you wish to add any functionality you need to follow certain rules:

 - All quotes must be escaped, so `if [[ "$gitBranch" != "" ]]; then` becomes `if [[ \"\$gitBranch\" != \"\" ]]; then`
 - Variables must be escaped with `\` before the `$` such as \"\$gitBranch\"
 - Color codes must be escaped as `\"\\[\$COLOR_YELLOW\\]\"`

To make the function configurable, there is a simple comment notation in place. To mark a section of code, follow these rules:

    # :start-label
        ... code indented by 4 spaces ...
    # /end-label

The above code will essentially wrap that block in `<div class="toggle start-label">...</div>` which you can add a checkbox for. By default a checkbox with this markup will toggle the above code label: 

    <input type="checkbox" value="sart-label" id="sart-label" />
 
## Modifying the website: 

## Submitting a pull request:
Please indent all lines with four spaces. Keep all CSS rules on one line except cross-browser duplicate rules. Do not put a space after the colon. Make your commit message descriptive and submit a squashed commit as suggested [here](http://sandofsky.com/blog/git-workflow.html).

 [http://andrewray.me/bash-prompt-builder/index.html](http://andrewray.me/bash-prompt-builder/index.html) 
