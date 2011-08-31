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
        },
        serialize: function() {
            var serialized = [],
                type,
                val,
                toQuery = function(id, value) {
                    return encodeURIComponent(id) + '=' + encodeURIComponent(value);
                };
            $$('input[type="text"], input[type="checkbox"]').each(function(item) {
                switch(item.type) {
                    case 'text':
                        serialized.push(toQuery(item.id, item.value.trim()));
                    break;
                    case 'checkbox':
                        serialized.push(toQuery(item.id, item.checked || false));
                    break;
                }
            });
            return '#' + serialized.join('&');
        },
        deserialize: function(str) {
            var values = str.replace(/^#/, '').parseQueryString();
            $$('input[type="text"], input[type="checkbox"]').each(function(item) {
                switch(item.type) {
                    case 'text':
                        item.value = values[item.id];
                    break;
                    case 'checkbox':
                        item.checked = values[item.id] == 'true';
                    break;
                }
                item.fireEvent('change');
            });
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
        'git-bisect': 'Show text if bisecting (initiated by `git bisect`) and currently bisected revision.',

        // hg options
        hg: 'Toggles the Mercurial version of the bash prompt.',
        'hg-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'hg-conflicted': 'Shows a list of files (including relative paths)jin a conflicted state.',
        'hg-prefix': 'Add "hg:" to show that you are in a Mercurial repository.',
        'hg-revno': 'The current revision ID.',
        'hg-bisect': 'Show text if bisecting (initiated by `hg bisect`) and currently bisected revision.',
        'hg-patches': 'Show list of *applied* mq patches. Will show [patch1] in prompt after command `hg qnew patch1`.',

        // svn options
        svn: 'Toggles the Subversion version of the bash prompt Subversion is the slowest and can add up to 100ms to your prompt display time.',
        'svn-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'svn-revno': 'The current revision ID.',

        // Character options
        'modified-char': 'The character to show if you have any locally modified, added or deleted files.',
        'conflict-char': 'The character to show before the list of files currently in a conflicted state. Defaults to a unicdoe butt, because you are in a shitty situation.',

        // Default options
        'default': 'No description found. God I am so lazy',
        'conflicted-files': 'index.js,path/to/package.json,filename.txt,awful.php,...',
        'no-branch-text': 'Text to show when you are lost in space (detached head)',
        'bisecting-text': 'Text to show when bisecting. Current commit comes after automatically.'
    },
        $deltaChars,
        $conflictChars,
        $conflictedFiles,
        $bisectingTexts,
        $noBranchTexts;

    window.addEvent('domready', function() {
        // Make the body and displays noisy and tag it with webkit
        document.body.noisify({
            monochrome: false
        }).addClass(Browser.Engine.webkit ? 'webkit' : '');
        $$('.form-buttons').noisify();

        var $built = $('function'),
            lines = $built.get('html').split('\n'),
            output = '',
            index = 1,
            line = lines[0],
            instructionStart,
            stack = [],
            totalLines = lines.length;

        $$('.nav').addEvent('click:relay(a)', function(evt) {
            evt.preventDefault();
            window.scrollTo(0, $(this.get('href').substring(1)).getPosition().y);
        });

        $('float').addEvent('click', floatControls);
        $('dock').addEvent('click', hideControls);
        $('select').addEvent('click', function() {
            $('function').selectText();
        });
        $('link').addEvent('click', popLink);

        $('expand').addEvent('click', toggleCodeView);
        $('despand').addEvent('click', toggleCodeView);
        
        $('modified-char').addEvents({
            change: updateDeltaChars,
            keyup: updateDeltaChars
        }).funPicker({picker: $('modified-picker')});

        $('conflict-char').addEvents({
            change: updateConflictCharacters,
            keyup: updateConflictCharacters
        }).funPicker({picker: $('conflict-picker')});

        $('max-conflicted-files').addEvents({
            change: updateConflictedFilesList
        });

        $('bisecting-text').addEvents({
            change: updateBisectText,
            keyup: updateBisectText
        }).funPicker({
            picker: $('bisect-picker'), 
            append: true
        });
        $('no-branch-text').addEvents({
            change: updateNoBranchText,
            keyup: updateNoBranchText
        });

        $('comments').addEvents({
            click: toggleComments,
            change: toggleComments
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
                    $div[$input.checked ? 'show' : 'hide']();
                }

                updateLink();
            }
        }).each(function($cb) {
            if($cb.id == 'comments') {
                $cb.set('checked', false);
            } else {
                $cb.set('checked', 'checked')
            }
            $cb.funForm();
        });
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
                    .replace(/(#(.+|$))/, '<span class="comment">$1<br /></span>')
                    .replace(/#([a-zA-Z_0-9]+)#/, '<span id="$1"></span>'));

                newLine += (newLine.indexOf('class="comment"') == -1 ? '<br />' : '');

                if(current && !current.indexOf('option-')) {
                    newLine = newLine.replace(/>(['"])([^'"]+)(['"]?)<br/, '>$1<span class="configurable ' + current + '">$2</span>$3<br');
                }

                output += newLine;
            }
            line = lines[index++];
        } while (line !== undefined);

        $built.set('html', output).setStyle('display', 'block');

        // Cache our element selectors
        $deltaChars = $$('.option-delta'),
        $conflictChars = $$('.option-conflict');
        $conflictedFiles = $$('.conflicted-files');
        $bisectingTexts = $$('.option-bisecting');
        $noBranchTexts = $$('.option-nobranch');

        if(window.location.hash && window.location.hash.trim() != '#') {
            $('options').deserialize(window.location.hash);
            window.location.replace('#');
        }

        updateLink();
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
        $('nav-options').hide();
        $('config-buttons').addClass('floated');
        $('options').addClass('floated');
    }

    function hideControls() {
        $('float').show();
        $('dock').hide();
        $('nav-options').show();
        $('config-buttons').removeClass('floated');
        $('options').removeClass('floated');
    }

    function updateConflictCharacters() {
        var val = this.get('value');
        $conflictChars.forEach(function($conflict) {
            $conflict.set('text', val ? (val + ($conflict.hasClass('configurable') ? '' : ' ')) : '');
        });
        updateLink();
    }

    function updateDeltaChars() {
        var val = this.get('value');
        $deltaChars.forEach(function($delta) {
            $delta.set('text', val ? (($delta.hasClass('configurable') ? '' : ' ') + val) : '');
        });
        updateLink();
    }

    function updateConflictedFilesList() {
        var split = optionDetails['conflicted-files'].split(','),
            val = Math.max(0, parseInt(this.get('value'))) || 0;
        $conflictedFiles.set('text', split.slice(0, val).join(', '));
        this.set('value', val).focus();
        updateLink();
    }

    function toggleCodeView() {
        $('function').toggleClass('expanded');
        $('expand').toggle();
        $('despand').setStyle('display', (toggleCodeView.expanded = !toggleCodeView.expanded) ? 'inline' : 'none');
    }

    function updateBisectText() {
        updateLink();
        $bisectingTexts.set('text', this.get('value'));
    }

    function updateNoBranchText() {
        $noBranchTexts.set('text', this.get('value'));
        updateLink();
    }

    function popLink() {
        var input = new Element('input').set({
            value: getLink(),
            type: 'text'
        }).addEvent('focus', function() {
            this.select();
        });
        new MooDialog.Alert(input);
    }

    function getLink() {
        return window.location.href.replace(/#.*$|$/, $('options').serialize());
    }

    function updateLink() {
        $('auto_url').set('text', getLink());
    }

    function toggleComments() {
        $$('.comment')[this.checked ? 'hide' : 'show']();
    }

	function deselect() {
		if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
	}
})();
