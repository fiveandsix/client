var args = arguments[0] || {};

var menuHidden = true;

function hideMenu(container) {
    $.menuView.animate({
        left : -280,
        duration : 100
    }, function() {
        $.menuView.left = -280;
        args.container.remove($.menuUnderlay);
        args.container.remove($.menuView);
    });
    menuHidden = true;
};

function showMenu(container) {
    args.container.add($.menuUnderlay);
    args.container.add($.menuView);
    $.menuView.animate({
        left : 0,
        duration : 100
    }, function() {
        $.menuView.left = 0;
        $.menuUnderlay.opacity = 0.7;
    });
    menuHidden = false;
};

function toggleMenu() {
    if(menuHidden) {
        showMenu();
    } else {
        hideMenu();
    }
};

function isMenuHidden() {
    return menuHidden;
};

function onMenuUnderlayClick() {
    hideMenu();
};

function onMenuSwipe(e) {
    if(e.direction == 'left') {
        hideMenu();
    }
};

var items = ['inbox', 'todo', 'done', 'trash'];

function clearBackground() {
    items.forEach(function(name) {
        $['item_' + name].backgroundColor = Alloy.Globals.Colors.menu_background;
    });
};

function setBackground(name) {
        $['item_' + name].backgroundColor = Alloy.Globals.Colors.menu_selection;
};

function selectItem(name) {
        clearBackground();
        setBackground(name);
};

function mkOnItem(name) {
    return function() {
        args.callback(name);
        selectItem(name);
        hideMenu();
    };
};

var onItemInbox = mkOnItem('inbox');
var onItemTodo = mkOnItem('todo');
var onItemDone = mkOnItem('done');
var onItemTrash = mkOnItem('trash');

exports.show = showMenu;
exports.hide = hideMenu;
exports.toggle = toggleMenu;
exports.select = selectItem;
exports.is_hidden = isMenuHidden;
