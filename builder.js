(function() {
    // Implement a function to select the contents of an HTML element that isn't a form element
    Element.implement({
        // Select all text inside an element, like a div
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
            return this;
        },
        // Serialize the inputs, checkboxes and color pickers inside an element to a string
        serialize: function() {
            var serialized = [],
                type,
                val,
                toQuery = function(id, value) {
                    return encodeURIComponent(id) + '=' + encodeURIComponent(value);
                },
                lookupByColorCode = function(code) {
                    for(var color in colorCodes) {
                        if(colorCodes[color] == code) {
                            return color;
                        }
                    }
                    return 'Well, we\'re fucked';
                };
            this.getElements('input[type="text"], input[type="checkbox"], div.color-picker').each(function(item) {
                switch(item.type) {
                    case 'text':
                        if((val = item.value) && val.trim()) {
                            serialized.push(toQuery(item.id, val));
                        }
                    break;
                    case 'checkbox':
                        if(item.checked) {
                            serialized.push(toQuery(item.id, 1));
                        }
                    break;
                    default:
                        if(item.hasClass('color-picker')) {
                            serialized.push(toQuery(
                                'color-' + item.getPrevious('input').id,
                                // Shorten the color code (color-cyan > 4)
                                lookupByColorCode(item.get('class').replace('color-picker ', ''))
                            ));
                        }
                    break;
                }
            });
            return '#' + serialized.join('&');
        },
        deserialize: function(str) {
            var values = str.replace(/^#/, '').parseQueryString();
            this.getElements('input[type="text"], input[type="checkbox"], div.color-picker').each(function(item) {
                switch(item.type) {
                    case 'text':
                        item.value = values[item.id] || '';
                    break;
                    case 'checkbox':
                        item.checked = values[item.id] == '1';
                    break;
                    default:
                        if(item.hasClass('color-picker')) {
                            item.set('class', 'color-picker ' + colorCodes[values['color-' + item.getPrevious('input').id]]);
                        }
                    break;
                }
                item.fireEvent('change');
            });
        },
        getTextLikeTheBrowserWould: function() {
            var temp = this.clone();
            temp.getElements(':invisible').destroy();
            return temp.get('text').replace(/ |&amp;/g, ' ');
        },
        typeModifies: function($collection) {
            var modify = function() {
                $collection.set('text', this.get('value'));
                updateLink();
            };
            this.addEvents({
                change: modify,
                keyup: modify
            });
            return this;
        }
    });

    $extend(Selectors.Pseudo, {
        invisible: function() {
            if(this.getStyle('visibility') == 'hidden' || this.getStyle('display') == 'none') {
                return this;
            }
        }
    });
    
    ZeroClipboard.setMoviePath('ZeroClipboard10.swf');

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
        'git-submodule': 'Show text if in a submodule (submodule add remote, etc)',
        'git-ontag': 'Show current tag, including local tags, such as `git tag 1.0` will show 1.0 in prompt`',
        'submodule-text': 'Text to show if in a submodule.',

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
        'option-modified': 'The character to show if you have any locally modified, added or deleted files.',
        'option-conflict': 'The character to show before the list of files currently in a conflicted state.',

        // Default options
        'default': 'No description found. God I am so lazy.',
        'general-options': 'Barf.',
        'comments': 'Remove comments from function.',
        'conflicted-files': 'index.js,path/to/package.json,filename.txt,awful.php,...',
        'option-nobranch': 'Text to show when you are lost in space (detached head)',
        'bisecting-text': 'Text to show when bisecting. Current commit comes after automatically.'
    // Used to shorten colors in URL saved link
    }, colorCodes = {
        '0': 'color-black',
        '1': 'color-red',
        '1b': 'color-lightred',
        '2': 'color-green',
        '2b': 'color-lightgreen',
        '3': 'color-yellow',
        '3b': 'color-lightyellow',
        '4': 'color-blue',
        '4b': 'color-lightblue',
        '5': 'color-magenta',
        '5b': 'color-lightmagenta',
        '6': 'color-cyan',
        '6b': 'color-lightcyan',
        '7b': 'color-white'
    // Default colors for function output. Formated function auto-fills colors from this object
    }, colorDefaults = {
        'color-git': 'COLOR_YELLOW',
        'color-git-prefix': 'COLOR_YELLOW',
        'color-git-modified': 'COLOR_YELLOW',
        'color-option-nobranch': 'COLOR_RED',
        'color-git-submodule': 'COLOR_MAGENTA',
        'color-git-bisect': 'COLOR_MAGENTA',
        'color-git-ontag': 'COLOR_YELLOW',
        'color-git-ahead': 'COLOR_CYAN',
        'color-hg': 'COLOR_MAGENTA',
        'color-hg-prefix': 'COLOR_MAGENTA',
        'color-hg-bisect': 'COLOR_YELLOW',
        'color-hg-patches': 'COLOR_YELLOW',
        'color-hg-modified': 'COLOR_PURPLE',
        'color-svn': 'COLOR_CYAN',
        'color-svn-revno': 'COLOR_CYAN',
        'color-svn-modified': 'COLOR_CYAN',
        'color-conflicted': 'COLOR_RED',
        'color-conflict-char': 'COLOR_YELLOW'
    },
        $deltaChars,
        $conflictChars,
        $conflictedFiles,
        $bisectingTexts,
        $submoduleTexts,
        $noBranchTexts,
        $display,
        $conflicteds,
        $funktion,
        $formButtons;

    window.addEvent('domready', function() {

        // Make the body and displays noisy and tag it with webkit
        document.body.noisify({
            monochrome: false
        }).addClass(Browser.Engine.webkit ? 'webkit' : '');
        ($formButtons = $$('.form-buttons')).noisify();

        var $built = $('function'),
            lines = $built.get('html').split('\n'),
            output = '',
            index = 1,
            line = lines[0],
            instructionStart,
            stack = [],
            totalLines = lines.length;

        // Parse the code
        do {
            var current = stack[stack.length - 1];

            if(line.indexOf('# :else') > -1) {
                output += '</div><div class="toggle opposite ' + current + '">';
            } else if((instructionStart = line.indexOf('# :')) > -1) {
                var last = line.substring(instructionStart + 3);
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
                    .replace(/\b(if|then|else|fi)\b/g, '<span class="keyword">$1</span>')

                    // Make all colors hidable
                    .replace(/(\\\\\[\\\$color-[a-z-]+\\\\\])/g, '<span class="color-value">$1</span>')

                    // Make the color values replaceable
                    .replace(/\$(color-[a-z-]+)/g, function(whole, part) {
                        return '<span class="' + part + '">$' + colorDefaults[part] + '</span>';
                    })
                    
                    // Highlight variables
                    .replace(/(\$[a-zA-Z_]+)/g, '<span class="variable">$1</span>')

                    // Highlight comments
                    .replace(/(#(.+|$))/, '<span class="comment">$1<br /></span>\r\n')

                    // Mark replaceable areas like #auto_url#
                    .replace(/#([a-zA-Z_0-9]+)#/, '<span id="$1"></span>'));

                newLine += (newLine.indexOf('class="comment"') == -1 ? '<br />\r\n' : '');

                if(current && !current.indexOf('option-')) {
                    newLine = newLine.replace(/>(['"]?)([^'"= ]+)(['"]?)<br/, '>$1<span class="configurable ' + current + '">$2</span>$3<br');
                }

                output += newLine;
            }
            line = lines[index++];
        } while (line !== undefined);

        $built.set('html', output).setStyle('display', 'block');

        // Cache our element selectors
        $deltaChars = $$('.option-delta');
        $conflictChars = $$('.option-conflict');
        $conflictedFiles = $$('.conflicted-files');
        $bisectingTexts = $$('.option-bisecting');
        $submoduleTexts = $$('.option-submodule');
        $noBranchTexts = $$('.option-nobranch');
        $display = $$('.display')[0];
        $funktion = $('function');
        $conflicteds = $$('#git-conflicted, #hg-conflicted');

        // Navigation clicks
        $$('.nav').addEvent('click:relay(a)', function(evt) {
            evt.preventDefault();
            window.scrollTo(0, $(this.get('href').substring(1)).getPosition().y);
        });

        // Configuraiton clicks
        $('float').addEvent('click', floatControls);
        $('dock').addEvent('click', hideControls);

        wheresMyClippy($('copy-config'), $('function'));
        wheresMyClippy($('copy-form'), $('function'));

        $('link').addEvent('click', popLink);

        $('expand').addEvent('click', toggleCodeView);
        $('despand').addEvent('click', toggleCodeView);
        
        // Modified character picker and events
        $('option-modified').addEvents({
            change: updateDeltaChars,
            keyup: updateDeltaChars
        }).funPicker({picker: $('modified-picker')});

        // Conflict character picker and events
        $('option-conflict').addEvents({
            change: updateConflictCharacters,
            keyup: updateConflictCharacters
        }).funPicker({picker: $('conflict-picker')});

        // Conflicted file input events
        $('max-conflicted-files').addEvents({
            change: updateConflictedFilesList
        });

        // Bisecting text picker and events
        $('bisecting-text').typeModifies($bisectingTexts).funPicker({
            picker: $('bisect-picker'), 
            append: true
        });
        $('option-nobranch').typeModifies($noBranchTexts);
        $('submodule-text').typeModifies($submoduleTexts);

        $('comments').addEvents({
            change: toggleComments
        });

        $('no-colors').addEvents({
            change: toggleColors
        });

        // Color pickers
        $$('.color-picker').funPicker({
            picker: $('color-picker'),
            // Custom pick function to set the classname, then fire change
            pickFunction: function(evt) {
                this.input.set('class', 'color-picker ' + evt.target.get('class')).fireEvent('change');
            }
        // Change captured separately in case deserialize script calles change and we need to react
        }).addEvent('change', function() {
            var color = this.get('class').replace('color-picker ', ''),
                modifier = this.getPrevious('input').id;

            // Give the elements in the display the right color class
            $display.getElements('.' + modifier).each(function($item) {
                $item.set('class', $item.get('class').replace(/ ?color-[a-z]+|$/, ' ' + color));
            });

            if(modifier.indexOf('-conflicted') > 1) {
                modifier = 'conflicted';
            }

            // Give the variables in the output function the right values
            $funktion.getElements('.color-' + modifier).getFirst().set('text', '$' + color.toUpperCase().replace(/-/g, '_'));

            updateLink();
        });

        var childClick,
            parentToggle;

        // Wire up change events for checkboxes
        $$('input[type="checkbox"]').addEvents({
            mouseover: updateDescription.bindWithEvent(this),
            'fun-change': function(evt) {
                var $input = this,
                    $divs = bySelector('.' + $input.id),
                    x = 0,
                    $div,
                    toggles = $input.get('data-toggle');
                
                // If our change event comes from child turning on master checkbox, don't toggle children
                if(toggles && !childClick) {
                    parentToggle = true;
                    $$('#' + (toggles.split(' ').join(',#'))).set('checked', $input.checked).fireEvent('change');
                    parentToggle = false;
                }

                for(; $div = $divs[x++];) {
                    $div[$input.checked ? 'show' : 'hide']();
                }

                if($input.id.indexOf('-conflicted') > -1) {
                    var both = $conflicteds.get('checked').join(''),
                        $group = $('group-max-conflict');
                    if(both == 'falsefalse') {
                        $$('.conflicts').toggle();
                        $('group-conflict').toggleClass('disabled');
                        $('option-conflict').set('disabled', true);
                        $('max-conflicted-files').set('disabled', true);
                        $group.toggleClass('disabled');
                    } else if($group.hasClass('disabled')) {
                        $$('.conflicts').toggle();
                        $('group-conflict').toggleClass('disabled');
                        $('option-conflict').set('disabled', false);
                        $('max-conflicted-files').set('disabled', false);
                        $group.toggleClass('disabled');
                    }
                }

                updateLink();
            }
        // Override stupid firefox's pattern and auto-check everything
        }).each(function($cb) {
            if($cb.id == 'comments' || $cb.id == 'no-colors') {
                $cb.set('checked', false);
            } else {
                $cb.set('checked', 'checked');
            }
            $cb.funForm();
        // Target only the child checkboxes and make them turn on parent checkbox
        }).erase($('.git-all')).erase($('hg')).erase($('svn')).addEvent('change', function(evt) {
            // If our change event comes from master toggle, ignore it
            if(!parentToggle) {
                childClick = true;
                var me = this;
                $$('.git-all, .hg-all, .svn-all').each(function($master) {
                    if($master.get('data-toggle').indexOf(me.get('id')) > -1) {
                        $master.set('checked', 'checked').fireEvent('change');
                    }
                });
                childClick = false;
            }
        });

        $$('input[type="text"]').addEvent('mouseover', updateDescription.bindWithEvent(this));

        $$('.config label').addEvent('mouseover', updateDescription.bindWithEvent(this));

        $('presets').getChildren()[0].selected = true;
        $('presets').addEvent('change', updatePreset);

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
            val = Math.max(0, parseInt(this.get('value'), 10)) || 0;
        $conflictedFiles.set('text', split.slice(0, val).join(', '));
        this.set('value', val).focus();
        $$('.option-max-conflicted-files').set('text', val);
        updateLink();
    }

    function toggleColors(evt) {
        var checked = this.checked,
            showHide = checked ? 'hide' : 'show';
        $display.toggleClass('blanco-niño', checked);
        $funktion.getElements('.color-value')[showHide]();
        $('options').toggleClass('blanco-niño', checked);
        $$('.color-list')[showHide]();
        updateLink();
    }

    function toggleCodeView() {
        $('function').toggleClass('expanded');
        $('expand').toggle();
        $('despand').setStyle('display', (toggleCodeView.expanded = !toggleCodeView.expanded) ? 'inline' : 'none');
    }

    function popLink() {
        var input = new Element('input').set({
            value: getLink(),
            type: 'text'
        }).addEvent('focus', function() {
            this.select();
        });
        var dialog = new MooDialog.Alert(input, {
            okText: 'Copy and Dismiss'
        });
        wheresMyClippy(dialog.okButton, input, false);
    }

    function getLink() {
        return window.location.href.replace(/#.*$|$/, $('options').serialize());
    }

    function updateLink() {
        $('auto_url').set('text', getLink());
    }

    function updatePreset() {
        $('options').deserialize(this.value);
    }

    function toggleComments(evt) {
        $$('.comment')[this.checked ? 'hide' : 'show']();
    }

	function deselect() {
		if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
	}

    // There's my clippy!
    function wheresMyClippy($button, $copyBoard, confirmation) {
        var clippy = new ZeroClipboard.Client();

        clippy.glue($button, $button.getParent());
        clippy.setHandCursor(true);
        clippy.addEventListener('mouseDown', function(client) { 
            if($copyBoard.get('tag') == 'input') {
                clippy.setText($copyBoard.value);
                $copyBoard.select();
            } else {
                clippy.setText($copyBoard.selectText().getTextLikeTheBrowserWould());
            }
            $button.addClass('toggled');
        });

        clippy.addEventListener('mouseUp', function(client) { 
            $button.removeClass('toggled');
        });

        clippy.addEventListener('onComplete', function(client) {
            if(confirmation !== false) {
                new MooDialog.Alert(new Element('p', {
                    text: 'Copied! Paste in ~/.bashrc'
                }));
            }
            $button.fireEvent('click');
        });

        return clippy;
    }
})();
