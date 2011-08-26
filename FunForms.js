var FunCheckbox = new Class({
    Implements: Options,

    options: {
        // How many percent of the image that is filled with noise,
        // represented by a number between 0 and 1 inclusive
        intensity: 0.9,

        // The width and height of the image in pixels
        size: 200,

        // The maximum noise particle opacity,
        // represented by a number between 0 and 1 inclusive
        opacity: 0.08,

        // A string linking to the image used if there's no canvas support
        fallback: '',

        // Specifies wheter the particles are grayscale or colorful
        monochrome: false
    },

    initialize: function(input, options){
        this.input = input.hide();

        this.container = new Element('div')
            .addClass('fun-checkbox' + (input.checked ? ' checked' : ''))
            .inject(input, 'after')
            .addEvent('click', this.toggle.bindWithEvent(this));

        input.addEvent('change', this.toggle.bind(this));

        this.checked = !!input.checked;

        options && this.setOptions(options);
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
    funForm: function(options){
        new FunCheckbox(this, options);
        return this;
    }
});
