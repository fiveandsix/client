'use strict';

exports.set_title = function(container, title) {
    if(OS_ANDROID) {
        var actionBar = container.getActivity().getActionBar();
        actionBar.title = title;
    } else if(OS_IOS) {
        container.title = title;
    }
};
