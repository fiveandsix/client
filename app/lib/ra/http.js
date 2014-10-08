var when = require('when/when');

var defaultTimeout = 30000;
var _defaultContentType = "application/x-www-form-urlencoded";

var handlers  = {
    json: function(httpc) {
        console.log('parsing response text', httpc.responseText);
        var result = JSON.parse(httpc.responseText);
        console.log('done');
        return result;
    }
};

var open = function(method, url, args) {
    args = args || {};
    args.url = url;
    args.handleAs = args.handleAs || 'json';
    var httpc = Titanium.Network.createHTTPClient();
    var deferred = new when.defer();

    httpc.onload = function() {
        if(httpc.status == 200) {
            if(args.handleAs) {
                try {
                    var result = handlers[args.handleAs](httpc);
//                    console.log('about to resolve');
                    deferred.resolve(result);
                } catch(e) {
//                    console.log('failure handling response with: ', args.handleAs);
                    deferred.reject(e);
                }
            } else {
                deferred.resolve(httpc.responseText);
            }
        } else {
            deferred.reject(new Error('Bad HTTP response code: ' + httpc.status));
        }
    };

    httpc.onreadystatechange = function() {
//        console.log('onreadystate', this.readyState);
    };

    httpc.onerror = function(error) {
//        console.log('httpc error', error);
        deferred.reject(error);
    };

    httpc.setTimeout(args.timeout ? args.timeout : defaultTimeout);

    httpc.open(method, args.url, true);

    if(args.contentType){
        httpc.setRequestHeader("Content-Type", args.contentType || _defaultContentType);
    }

    if(args.token){
        httpc.setRequestHeader('Authorization', 'Bearer ' + args.token);
    }

    if(args.data) {
        httpc.send(args.data);
    } else {
        httpc.send();
    }

    return deferred.promise;
};

var get = function(url, args) {
    return open('GET', url, args);
};

var post = function(url, data, args) {
    args.data = data;
    return open('POST', url, args);
};

module.exports = {
    get: get,
    post: post
};
