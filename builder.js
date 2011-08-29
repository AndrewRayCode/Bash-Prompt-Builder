(function() {
    // Implement a function to select the contents of an HTML element that isn't a form element
    Element.implement({
        selectText: function() {
            deselect();
            if (document.selection) {
                var range = document.body.createTextRange();
                    range.moveToElementText(this);
                range.select();
            } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(this);
                window.getSelection().addRange(range);
            }
        }
    });

    // Rollover text and default texts
    var optionDetails = {
        // git options
        git: 'Toggles the Git version of the bash prompt.',
        'git-ahead': 'Shows how many local commits you have ahead of the upstream repository.',
        'git-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'git-conflicted': 'Shows list of files (including relative paths) in a conflicted state.',
        'git-revno': 'The current revision ID.',
        'git-prefix': 'Add "git:" to show that you are in a Git repository.',
        'git-bisect': 'Show text if bisecting and currently bisected revision.',

        // hg options
        hg: 'Toggles the Mercurial version of the bash prompt.',
        'hg-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'hg-conflicted': 'Shows a list of files (including relative paths)jin a conflicted state.',
        'hg-prefix': 'Add "hg:" to show that you are in a Mercurial repository.',
        'hg-revno': 'The current revision ID.',

        // svn options
        svn: 'Toggles the Subversion version of the bash prompt Subversion is the slowest and can add up to 100ms to your prompt display time.',
        'svn-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'svn-revno': 'The current revision ID.',

        // Character options
        'modified-char': 'The character to show if you have any locally modified, added or deleted files.',
        'conflict-char': 'The character to show before the list of files currently in a conflicted state. Defaults to a unicdoe butt, because you are in a shitty situation.',

        // Default options
        'default': 'No description found. God I am so lazy',
        'conflicted-files': 'index.js,path/to/package.json,filename.txt,awful.php,...'
    },
        $deltaChars,
        $conflictChars,
        $conflictedFiles;

    window.addEvent('domready', function() {
        // Make the body and displays noisy and tag it with webkit
        document.body.noisify({
            monochrome: false
        }).addClass(Browser.Engine.webkit ? 'webkit' : '');
        $$('.screen').noisify();

        var $built = $('function'),
            $options = $('options'),
            lines = $built.get('html').split('\n'),
            output = '',
            index = 1,
            line = lines[0],
            instructionStart,
            stack = [],
            totalLines = lines.length;

        $('float').addEvent('click', floatControls);
        $('dock').addEvent('click', hideControls);
        $$('#float-select, #select').addEvent('click', function() {
            $('function').selectText();
        });

        $('expand').addEvent('click', toggleCodeView);
        $('despand').addEvent('click', toggleCodeView);
        
        $('modified-char').addEvents({
            change: updateDeltaChars,
            keyup:  updateDeltaChars
        }).funPicker({picker: $('modified-picker')});

        $('conflict-char').addEvents({
            change: updateConflictCharacters,
            keyup:  updateConflictCharacters
        }).funPicker({picker: $('conflict-picker')});

        $('max-conflicted-files').addEvents({
            change: updateConflictedFilesList
        });

        $$('input[type="checkbox"]').addEvents({
            mouseover: updateDescription.bindWithEvent(this),
            'fun-change': function(evt) {
                var $input = this,
                    $divs = bySelector('.' + $input.id),
                    x = 0,
                    $div,
                    toggles = $input.get('data-toggle');
                
                if(toggles) {
                    $$('#' + (toggles.split(' ').join(',#'))).set('checked', $input.checked).fireEvent('change');
                }

                for(; $div = $divs[x++];) {
                    $div.toggle();
                }
            }
        }).set('checked', 'checked').funForm();
        $$('input[type="text"]').addEvent('mouseover', updateDescription.bindWithEvent(this));

        $$('.config label').addEvent('mouseover', updateDescription.bindWithEvent(this));

        do {
            var current = stack[stack.length - 1];

            if(line.indexOf('# :else') > -1) {
                output += '</div><div class="toggle opposite ' + current + '">';
            } else if((instructionStart = line.indexOf('# :')) > -1) {
                var last = line.substring(instructionStart + 3)
                stack.push(last);

                if(last.indexOf('option-')) {
                    output += '<div class="toggle ' + last + '">';
                }
            } else if(line.indexOf('# /') > -1) {
                stack.pop();
                output += '</div>';
            } else {
                var newLine = (line
                    .replace(new RegExp('^\\s{' + (stack.length * 4) + '}'), '')
                    .replace(/ /g, '&nbsp;')
                    .replace(/([a-zA-Z_]+)=/, '<span class="line-def">$1</span><span class="operator">=</span>')
                    .replace(/\b(if|then|fi)\b/g, '<span class="keyword">$1</span>')
                    .replace(/(\$[a-zA-Z_]+)/g, '<span class="variable">$1</span>')
                    .replace(/(#.+)/, '<span class="comment">$1</span>'))
                    + '<br />';

                if(current && !current.indexOf('option-')) {
                    newLine = newLine.replace(/>(['"])([^'"]+)(['"]?)<br/, '>$1<span class="configurable ' + current + '">$2</span>$3<br');
                }

                output += newLine;
            }
            line = lines[index++];
        } while (line !== undefined);

        $built.set('html', output).setStyle('display', 'block');

        $deltaChars = $$('.option-delta'),
        $conflictChars = $$('.option-conflict');
        $conflictedFiles = $$('.conflicted-files');
    });

    var elementCache = {};

    function bySelector(selector) {
        if(elementCache[selector]) {
            return elementCache[selector];
        }
        return elementCache[selector] = $$(selector);
    }

    function updateDescription(evt) {
        $('placeholder').hide();
        $('wtf').set('text', optionDetails[evt.target.get('for') || evt.target.get('id')] || optionDetails['default']).setStyle('opacity', 0).fade('in');
        $('wtf-label').show();
    }

    function floatControls() {
        $('float').hide();
        $('dock').show();
        $('float-select').show();
        $('nav-options').hide();
        $('options').addClass('floated');
    }

    function hideControls() {
        $('float').show();
        $('dock').hide();
        $('float-select').hide();
        $('nav-options').show();
        $('options').removeClass('floated');
    }

    function updateConflictCharacters() {
        var val = this.get('value');
        $conflictChars.forEach(function($conflict) {
            $conflict.set('text', val ? (val + ($conflict.hasClass('configurable') ? '' : ' ')) : '');
        });
    }

    function updateDeltaChars() {
        var val = this.get('value');
        $deltaChars.forEach(function($delta) {
            $delta.set('text', val ? (($delta.hasClass('configurable') ? '' : ' ') + val) : '');
        });
    }

    function updateConflictedFilesList() {
        var split = optionDetails['conflicted-files'].split(','),
            val = Math.max(0, parseInt(this.get('value'))) || 0;
        $conflictedFiles.set('text', split.slice(0, val).join(', '));
        this.set('value', val).focus();
    }

    function toggleCodeView() {
        $('function').toggleClass('expanded');
        $('expand').toggle();
        $('despand').setStyle('display', (toggleCodeView.expanded = !toggleCodeView.expanded) ? 'inline' : 'none');
    }

	function deselect() {
		if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
	}
    
})();
