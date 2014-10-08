var args = arguments[0] || {};
var api = require('api');
var util = require('util');

var indicator = Alloy.createController('indicator');

function startProgress() {
    $.todo.top = indicator.height;
    indicator.start($.container);
}

function endProgress( ) {
    indicator.stop($.container);
    $.todo.top = 0;
}

function onMenuHome() {
    $.container.close({animated: false});
};

function onBack() {
    $.container.close({animated: false});
};

function onDelete() {
    startProgress();
    api.task_delete(args.task.get('id')).then(
        function() {
            args.task.set({status: 'deleted'}).save();
            $.container.close({animated: false});
            endProgress();
        },
        function() {
            endProgress();
        });
};

function onTodo() {
    startProgress();
    api.task_todo(args.task.get('id')).then(
        function() {
            util.set_title($.container, 'Instructions');
            args.task.set({status: 'todo'}).save();
            $.teaser.visible = false;
            $.todo.visible = true;

            if(OS_ANDROID) {
                var toast = Titanium.UI.createNotification({
                    message: 'Added to TODOs',
                    duration: Titanium.UI.NOTIFICATION_DURATION_SHORT
                });

                toast.show();
            }
            endProgress();
        },
        function(error) {
            endProgress();
        });
};

function onDone() {
    startProgress();
    api.task_done(args.task.get('id')).then(
        function(item) {
            var log = Alloy.createModel('log', {id: item.id, badge: item.bage, date: item.date, text: item.text});
            Alloy.Collections.log.add(log);
            log.save();
            endProgress();
            $.container.close({animated: false});
            args.task.set({status: 'new'}).save();
            args.callback();
        },
    function(error) {
        endProgress();
    });
};

if(OS_ANDROID) {
    $.container.activity.onCreateOptionsMenu = function(e) {
	var menu = e.menu;
	var menuItem = menu.add({
	    title : "Delete",
	    icon: 'images/trash.png',
	    showAsAction : Titanium.Android.SHOW_AS_ACTION_ALWAYS
	});
	menuItem.addEventListener("click", onDelete);
    };

    $.container.addEventListener('focus', function() {
        var actionBar = $.container.getActivity().getActionBar();
        actionBar.title = args.state == 'todo' ? 'Instructions' : 'Description';
        actionBar.displayHomeAsUp = true;
        actionBar.backgroundImage = 'images/bg-gray.png';
        actionBar.icon = '';
        actionBar.onHomeIconItemSelected = onMenuHome;
    });
} else if(OS_IOS) {
    var deleteButton = Titanium.UI.createButton({title : 'Delete', systemButton: Titanium.UI.iPhone.SystemButton.TRASH});
    var backButton = Titanium.UI.createButton({title : 'Back', systemButton: Titanium.UI.iPhone.SystemButton.DONE});
    deleteButton.addEventListener("click", onDelete);
    $.container.rightNavButtons = [deleteButton];
    $.container.title = 'Description';
}

$.teaser_title.text = args.task.get('title');
$.todo_title.text = args.task.get('title');

// we use Label on android and TextArea on IOS
if(OS_ANDROID) {
    $.teaser_text.text = args.task.get_body('description');
    $.todo_text.text = args.task.get_body('instructions');
} else if(OS_IOS) {
    $.container.title = 'Description';
    $.teaser_text.value = args.task.get_body('description');
    $.todo_text.value = args.task.get_body('instructions');
}

if(args.state == 'todo') {
    $.teaser.visible = false;
    $.todo.visible = true;
}
