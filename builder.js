(function() {
    var optionDetails = {
        git: 'Toggles the Git version of the bash prompt.',
        'git-ahead': 'Shows how many local commits you have ahead of the upstream repository.',
        'git-modified': 'Shows a character if you have any locally modified, added or deleted files.',
        'git-conflicted': 'Shows list of files in a conflicted state in the prompt.',
        hg: 'Toggles the Mercurial version of the bash prompt.',
        'hg-modified': '',
        'hg-conflicted': '',
        svn: 'Toggles the Subversion version of the bash prompt Subversion is the slowest and can add up to 100ms to your prompt display time.',
        'svn-modified': '',
        'modified-char': '',
        'conflict-char': 'The character to show before the list of files currently in a conflicted state. Defaults to a unicdoe butt, because you are in a shitty situation.',
        'default': 'No description found. God I am so lazy'
    };

    window.addEvent('domready', function() {
        document.body.noisify({
            monochrome: false
        });
        //$$('ul.nav').noisify();

        var $built = $('function'),
            $options = $('options'),
            lines = $built.get('html').split('\n'),
            output = '',
            index = 0,
            line = '',
            instructionStart,
            stack = [],
            totalLines = lines.length;

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

        $$('.config label').addEvent('mouseover', updateDescription.bindWithEvent(this));

        do {
            if(line.indexOf('# :else') > -1) {
                output += '</div><div class="toggle opposite ' + stack[stack.length - 1] + '">';
            } else if((instructionStart = line.indexOf('# :')) > -1) {
                stack.push(line.substring(instructionStart + 3));
                output += '<div class="toggle ' + stack[stack.length - 1 ] + '">';
            } else if(line.indexOf('# /') > -1) {
                stack.pop();
                output += '</div>';
            } else {
                output += (line
                    .replace(new RegExp('^\\s{' + (stack.length * 4) + '}'), '')
                    .replace(/ /g, '&nbsp;') + '<br />')
                    .replace(/([a-zA-Z_]+)=/, '<span class="line-def">$1</span><span class="operator">=</span>')
                    .replace(/\b(if|then|fi)\b/g, '<span class="keyword">$1</span>')
                    .replace(/(\$[a-zA-Z_]+)/g, '<span class="variable">$1</span>')
                    .replace(/(#.+)/, '<span class="comment">$1</span>');
            }
            line = lines[index++];
        } while (line !== undefined);

        $built.set('html', output).setStyle('display', 'block');
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
})();
