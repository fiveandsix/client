var when = require('when/when');
var api = require('api');

var title = 'Inbox';
var state = 'inbox';

$.container.title = title;

function showScreen(name) {
    state = name || state;
    menu.select(state);
    var mapping  = {inbox: 'new', todo: 'todo', done: 'done', trash: 'deleted'};
    var titles  = {inbox: 'Inbox', todo: 'Todo', done: 'Done', trash: 'Trash'};

    title = titles[state];

    if(OS_ANDROID) {
        var actionBar = $.container.getActivity().getActionBar();
        actionBar.title = title;
    } else if(OS_IOS) {
        $.container.title = title;
    }

    if(mapping[state] != 'done') {
        $.task_list.list.visible = true;
        $.log_list.list.visible = false;
        $.task_list.set_filter(mapping[state]);
        tasks.fetch();
    } else {
        $.task_list.list.visible = false;
        $.log_list.list.visible = true;
    }
};

var menu = Alloy.createController('menu', {container: $.container, callback: showScreen});
menu.select('inbox');

var indicator = Alloy.createController('indicator');

var tasks = Alloy.Collections.tasks;
var log = Alloy.Collections.log;

$.task_list.set_on_click(function(model) {
    _openWindow(Alloy.createController('detail', {task: model, callback: showScreen, state: state}).getView());
});

function startProgress() { // FIX what if we're in log list?
    $.task_list.list.top = indicator.height;
    indicator.start($.container);
}

function endProgress( ) {
    indicator.stop($.container);
    $.task_list.list.top = 0;
}

function _openWindow(window) {
    if(OS_ANDROID) {
        window.open({animated : false});
    } else if(OS_IOS) {
        $.navigation.openWindow(window, {animated: true});
    }
}

function onRefresh() {
    startProgress();
    reload(Titanium.App.Properties.getString('token')).finally(endProgress);
}

function onMenuHome() {
    menu.toggle();
}

function onBack() {
    if(!menu.is_hidden()) {
        menu.hide();
    } else {
        $.container.close();
        $.destroy();
    }
}

function reload(token) {
    return when.promise(function(resolve, reject, notify) {
        if(!api.is_logged()) {
            reject('not logged in');
        } else {
            // clear db
            var db = Titanium.Database.open('_alloy_');
            db.execute('DELETE FROM task;');
            db.close();

            // fetch tasks
            api.tasks(token).then(
                function(result) {
                    result.tasks.forEach(function(item) {
                        var task = Alloy.createModel('task', {id: item.id, kind: item.kind, status: item.status, title: item.title, body: item.body});
                        tasks.add(task);
                        task.save();
                    });
                    console.log('done tasks');
                    tasks.fetch();
                    resolve();
                },
                reject);
        }
    });
};

if(OS_ANDROID) {
    $.container.activity.onCreateOptionsMenu = function(e) {
	var menu = e.menu;
	var menuItem = menu.add({
	    title : "Refresh",
	    icon: 'images/reload.png',
	    showAsAction : Titanium.Android.SHOW_AS_ACTION_ALWAYS
	});
	menuItem.addEventListener("click", onRefresh);
    };

    $.container.addEventListener('focus', function() {
        var actionBar = $.container.getActivity().getActionBar();
        actionBar.title = title;
        actionBar.displayHomeAsUp = false;
        actionBar.backgroundImage = 'images/bg-gray.png';
        actionBar.icon = 'images/menu.png';
        actionBar.onHomeIconItemSelected = onMenuHome;

        tasks.fetch();
        log.fetch();
    });
} if(OS_IOS) {
    $.container.addEventListener('focus', function() {
        tasks.fetch();
        log.fetch();
    });
}


setTimeout(function() {
    var token = Titanium.App.Properties.getString('token');
    var connect;

    startProgress();

    if(token) {
        connect = api.login().then(function(token) {
            Titanium.App.Properties.setString('token', token);
            return token;
        });
    } else {
        connect = api.register().then(function() {
            return api.login().then(function(token) {
                Titanium.App.Properties.setString('token', token);
                return token;
            });
        });
    }

    connect.then(function(token) {
        return reload(token);
    }).finally(endProgress);

}, 1);
