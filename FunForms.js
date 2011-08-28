(function() {
    Element.implement({
        // Call as element.bind('event.namespace', function() {});
        bind: function(name, funktion) {
            // Get event type and namespace
            var split = name.split('.'),
                eventName = split[0],
                namespace = split[1];

            // Store the event by its full name including namespace
            this.bindCache = this.bindCache || {};

            if(this.bindCache[name]) {
                this.bindCache[name].push(funktion);
            } else {
                this.bindCache[name] = [funktion];
            }

            // Bind the function to the event
            this.addEvent(eventName, funktion);
        },
        
        // Call as element.unbind('event.namespace');
        unbind: function(name) {
            // Unbind the specified event
            var eventName = name.split('.')[0],
                funktions = this.bindCache[name],
                x = 0,
                funktion;

            for(; funktion = funktions[x++]; ) {
                this.removeEvent(eventName, funktion);
            }
        }
    });

    var FunPicker = new Class({
        Implements: Options,

        options: {
            offsetTop: 2
        },

        initialize: function(input, options){
            options && this.setOptions(options);

            var me = this;
            this.id = ++FunPicker.instances;

            this.input = input;
            this.picker = this.options.picker;

            this.bindEvents();
            this.picker.addEvent('click:relay(li)', this.pickClick.bindWithEvent(this));
        },

        bindEvents: function() {
            this.input.addEvents({
                focus: this.show.bind(this),
                click: this.show.bind(this)
            });
        },

        unbindEvents: function() {
            this.input.removeEvents('focus');
            this.input.removeEvents('click');
        },

        show: function() {
            document.body.bind('click.fun' + this.id, this.bodyClick.bindWithEvent(this));
            this.unbindEvents();

            var position = this.input.getPosition(),
                size = this.input.getSize();

            this.picker.setStyles({
                opacity: 0,
                display: 'block',
                left: position.x,
                top: position.y + size.y + this.options.offsetTop
            }).fade('in');
        },

        bodyClick: function(evt) {
            if(!(evt.target.getParents().contains(this.input) || evt.target == this.input)) {
                this.hide();
            }
        },

        hide: function() {
            document.body.unbind('click.fun' + this.id);
            this.bindEvents();

            this.picker.fade('out');
        },

        pickClick: function(evt) {
            this.input.set('value', evt.target.get('text'));
            this.hide();
        }
    });

    FunPicker.instances = 0;

    var FunCheckbox = new Class({
        Implements: Options,

        options: {
        },

        initialize: function(input, options){
            options && this.setOptions(options);

            this.input = input.hide();

            this.container = new Element('div')
                .addClass('fun-checkbox' + (input.checked ? ' checked' : ''))
                .inject(input, 'after')
                .addEvent('click', this.toggle.bindWithEvent(this));

            input.addEvent('change', this.toggle.bind(this));

            this.checked = !!input.checked;
        },

        toggle: function(evt) {
            if(evt && evt.type == 'click') {
                this.input.checked = !this.input.checked;
            }
            this.container.toggleClass('checked', (this.checked = !!this.input.checked));
            this.input.fireEvent('fun-change');
        }
    });

    Element.implement({
        funForm: function(options) {
            new FunCheckbox(this, options);
            return this;
        },
        funPicker: function(options) {
            new FunPicker(this, options);
            return this;
        }
    });
})();
