var Alloy = require('alloy');

Alloy.Collections.tasks = Alloy.createCollection('task');
Alloy.Collections.tasks.comparator = function(task) {
    return -task.get('id');
};
Alloy.Collections.log = Alloy.createCollection('log');

Alloy.Globals.Colors = {};

Alloy.Globals.Colors.list_background = 'white';
Alloy.Globals.Colors.list_separator = '#34495e';

Alloy.Globals.Colors.task_list_badge = '#f1c40f';
Alloy.Globals.Colors.task_list_badge_border = '#f1c40f';

Alloy.Globals.Colors.log_list_badge = '#26C281';
Alloy.Globals.Colors.log_list_badge_border = '#26C281';

Alloy.Globals.Colors.menu_background = 'white';
Alloy.Globals.Colors.menu_separator = '#34495e';
Alloy.Globals.Colors.menu_selection = '#C2EBFF';

Alloy.Globals.Colors.detail_button_ok_bg = '#2980b9';
Alloy.Globals.Colors.detail_button_ok_bg_selected = '#1067A0';
Alloy.Globals.Colors.detail_button_ok_border = '#004D86';

Alloy.Globals.Colors.detail_button_done_bg = '#27AE60';
Alloy.Globals.Colors.detail_button_done_bg_selected = '#0E9547';
Alloy.Globals.Colors.detail_button_done_border = '#007B2D';
