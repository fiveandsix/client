var tasks = Alloy.Collections.tasks;
var _status = 'new';
var _on_click;

function onListItemClick(e) {
    var itemId = e.section.getItemAt(e.itemIndex).properties.itemId;
    var model = Alloy.createModel('task');
    model.fetch({ id: itemId });
    _on_click(model);
//    _openWindow(Alloy.createController('detail', {task: model, callback: showScreen}).getView());
}

function filterList(collection) {
    return collection.where({status: _status});
};

exports.set_filter = function(status) {
    _status = status;
};

exports.set_on_click = function(callback) {
    _on_click = callback;
};
