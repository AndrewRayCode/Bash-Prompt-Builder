(function() {

$.when($('#function').load('js/templates/function.html')).then(function() {

var Toggler = function(on) {
    this.isSelected = ko.observable(on);
};

var ViewModel = function() {
    var self = this;

    self.git = new Toggler(true);
    self.svn = new Toggler(true);
    self.hg = new Toggler(true);
    
    self.items = ko.observableArray([
        new Toggler('Foo'), new Toggler('Bar'), new Toggler('Foo Bar')
    ]);
    
    self.selectedItems = ko.computed(function() {
        return ko.utils.arrayFilter(self.items(), function(item) {
            return item.isSelected();
        });
    });
};
    
ko.applyBindings(new ViewModel());

});

}());
