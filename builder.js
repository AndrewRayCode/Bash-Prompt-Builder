(function() {
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

        $$('input[type="checkbox"]').addEvent('fun-change', function(evt) {
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
        }).funForm();

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
                output += line.replace(/ /g, '&nbsp;') + '<br />';
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
})();
