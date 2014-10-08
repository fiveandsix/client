'use strict';

var when = require('when/when');
var http = require('ra/http');
var BASE = 'https://www.5and6.net/api/v1';
var globals = require('alloy').Globals;

if(Titanium.Platform.model == 'google_sdk' || Titanium.Platform.model == 'Simulator' || Titanium.Platform.model == "Genymotion ('Phone' version)") {
    BASE = 'http://192.168.33.30:8080/api/v1';
}

function url(path) {
    console.log('connecting to', BASE + path);
    return BASE + path;
};

function register() {
    return http.post(url('/register'), {id: Titanium.Platform.id}, {handleAs: 'json'});
}

function login() {
    console.log('logging in with', Titanium.Platform.id);
    return http.post(url('/login'), {id: Titanium.Platform.id, method: 'device'}, {handleAs: 'json'}).then(function(result) {
        globals.token = result.token;
        return result.token;
    });
}

function tasks() {
    return http.get(url('/tasks'), {handleAs: 'json', token: globals.token}).then(function(log) {
        return log;
    });
}

function task_done(task_id) {
    return http.post(url('/done'), {task_id: task_id}, {handleAs: 'json', token: globals.token});
}

function task_todo(task_id) {
    return http.post(url('/todo'), {task_id: task_id}, {handleAs: 'json', token: globals.token});
}

function task_delete(task_id) {
    return http.post(url('/delete'), {task_id: task_id}, {handleAs: 'json', token: globals.token});
}

module.exports = {
    is_logged: function() {
        return !!globals.token;
    },
    register: register,
    login: login,
    tasks: tasks,
    task_delete: task_delete,
    task_done: task_done,
    task_todo: task_todo
};
