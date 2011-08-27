Bash Prompt Builder
===========================
[Homepage](http://andrewray.me/fuzzy-complete/index.html) 

This is a website hosting a configurable function to modify your bash prompt to include DVCS information. Currently supported are Git, Mercurial (hg) and Subversion.

## Modifying the function: 
The entire function is stored in [index.html](https://github.com/DelvarWorld/Bash-Prompt-Builder/blob/master/index.html). If you wish to modify the function please do so in that file. Here is the tricky part. The function is stored in a giant string assigned to the variable dvcs_function. This variable is then executed in the PS1 output. 

If you wish to add any functionality you need to follow certain rules:

 - All quotes must be escaped, so `if [[ "$gitBranch" != "" ]]; then` becomes `if [[ \"\$gitBranch\" != \"\" ]]; then`
 - Variables must be escaped with `\` before the `$` such as \"\$gitBranch\"
 - Color codes must be escaped as `\"\\[\$COLOR_YELLOW\\]\"`

To make the function configurable, there is a simple comment notation in place. To mark a section of code, follow these rules:

    # :start-label
        ... code indented by 4 spaces ...
    # /end-label
 
## Modifying the website: 

## Submitting a pull request:

 [http://andrewray.me/fuzzy-complete/index.html](http://andrewray.me/fuzzy-complete/index.html) 
