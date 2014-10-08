var running = false;
var height = "3dp";
var sizes = [5, 13, 23, 35];
var delays = [500, 700, 1300];

function dropDot() {
    if(!running) return;
    var width = sizes[Math.floor(Math.random() * sizes.length)];
    var dot = Titanium.UI.createView({
        top: 0,
        left: "-" + width + "dp",
        height: height,
        width: width + "dp",
        backgroundColor: 'white'
    });

    $.indicator.add(dot);
    dot.animate({
        left: 1200,
        duration: 10000
    }, function() {
        $.indicator.remove(dot);
    });

    setTimeout(function() {
        dropDot();
    }, delays[Math.floor(Math.random() * delays.length)]);
};

exports.start = function(container) {
    container.add($.indicator);
    running = true;
    dropDot();
};

exports.stop = function(container) {
    running = false;
    container.remove($.indicator);
};


exports.height = height;
