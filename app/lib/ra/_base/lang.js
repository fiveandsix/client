var _global = (function(){return this;}).call();

var isString = function(it){
  return (typeof it == "string" || it instanceof String); // Boolean
},

isArray = function(it){
  return it && (it instanceof Array || typeof it == "array"); // Boolean
},

opts = Object.prototype.toString,

isFunction = function(it){
  return opts.call(it) === "[object Function]";
},

isObject = function(it){
  return it !== undefined &&
    (it === null || typeof it == "object" || lang.isArray(it) || lang.isFunction(it)); // Boolean
},

isArrayLike = function(it){
  return it && it !== undefined && // Boolean
  // keep out built-in constructors (Number, String, ...) which have length
  // properties
  !lang.isString(it) && !lang.isFunction(it) &&
    !(it.tagName && it.tagName.toLowerCase() == 'form') &&
    (lang.isArray(it) || isFinite(it.length));
},

_toArray = function(obj, offset, startWith){
  return (startWith||[]).concat(Array.prototype.slice.call(obj, offset||0));
},

_hitchArgs = function(scope, method){
  var pre = _toArray(arguments, 2);
  var named = lang.isString(method);
  return function(){
    // arrayify arguments
    var args = _toArray(arguments);
    // locate our method
    // XXX no global // var f = named ? (scope||dojo.global)[method] : method;
    var f = named ? scope[method] : method;
    // invoke with collected args
    return f && f.apply(scope || this, pre.concat(args)); // mixed
  }; // Function
},

hitch = function(scope, method){
  if(arguments.length > 2){
    return _hitchArgs.apply(null, arguments); // Function
  }
  if(!method){
    method = scope;
    scope = null;
  }
  if(lang.isString(method)){
    // XXX no global scope // scope = scope || dojo.global;
    if(!scope[method]){ throw(['dojo.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
    return function(){ return scope[method].apply(scope, arguments || []); }; // Function
  }
  return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
},

getProp = function(/*Array*/parts, /*Boolean*/create, /*Object*/context){
  var p, i = 0;
  if(!context){
    if(!parts.length){
      return _global;
    }else{
      p = parts[i++];
      try{
        context = dojo.scopeMap[p] && dojo.scopeMap[p][1];
      }catch(e){}
      context = context || (p in _global ? _global[p] : (create ? _global[p] = {} : undefined));
    }
  }
  while(context && (p = parts[i++])){
    context = (p in context ? context[p] : (create ? context[p] = {} : undefined));
  }
  return context; // mixed
},

setObject = function(name, value, context){
  var parts = name.split("."), p = parts.pop(), obj = getProp(parts, true, context);
  return obj && p ? (obj[p] = value) : undefined; // Object
},

getObject = function(name, create, context){
  return getProp(name.split("."), create, context); // Object
},

_pattern = /\{([^\}]+)\}/g,

replace = function(tmpl, map, pattern){
  return tmpl.replace(pattern || _pattern, lang.isFunction(map) ?
                       map : function(_, k){ return getObject(k, false, map); });
},

split = function(list, n) {
  var result = [], start=0, end;
  for(var i=0; start < list.length; i++) {
    end = start + n < list.length ? start + n : list.length;
    result.push(list.slice(start, end));
    start = start + n;
  }
  return result;
},

_mixin = function(dest, source, copyFunc){
  // summary:
  //      Copies/adds all properties of source to dest; returns dest.
  // dest: Object:
  //      The object to which to copy/add all properties contained in source.
  // source: Object:
  //      The object from which to draw all properties to copy into dest.
  // copyFunc: Function?:
  //      The process used to copy/add a property in source; defaults to the Javascript assignment operator.
  // returns:
  //      dest, as modified
  // description:
  //      All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
  //      found in Object.prototype, are copied/added to dest. Copying/adding each particular property is
  //      delegated to copyFunc (if any); copyFunc defaults to the Javascript assignment operator if not provided.
  //      Notice that by default, _mixin executes a so-called "shallow copy" and aggregate types are copied/added by reference.
  var name, s, i, empty = {};
  for(name in source){
    // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
    // inherited from Object.prototype.  For example, if dest has a custom toString() method,
    // don't overwrite it with the toString() method that source inherited from Object.prototype
    s = source[name];
    if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
      dest[name] = copyFunc ? copyFunc(s) : s;
    }
  }

  return dest; // Object
},


mixin = function(dest, sources){
  // summary:
  //      Copies/adds all properties of one or more sources to dest; returns dest.
  // dest: Object
  //      The object to which to copy/add all properties contained in source. If dest is falsy, then
  //      a new object is manufactured before copying/adding properties begins.
  // sources: Object...
  //      One of more objects from which to draw all properties to copy into dest. sources are processed
  //      left-to-right and if more than one of these objects contain the same property name, the right-most
  //      value "wins".
  // returns: Object
  //      dest, as modified
  // description:
  //      All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
  //      found in Object.prototype, are copied/added from sources to dest. sources are processed left to right.
  //      The Javascript assignment operator is used to copy/add each property; therefore, by default, mixin
  //      executes a so-called "shallow copy" and aggregate types are copied/added by reference.
  // example:
  //      make a shallow copy of an object
  //  | var copy = lang.mixin({}, source);
  // example:
  //      many class constructors often take an object which specifies
  //      values to be configured on the object. In this case, it is
  //      often simplest to call `lang.mixin` on the `this` object:
  //  | declare("acme.Base", null, {
  //  |       constructor: function(properties){
  //  |           // property configuration:
  //  |           lang.mixin(this, properties);
  //  |
  //  |           console.log(this.quip);
  //  |           //  ...
  //  |       },
  //  |       quip: "I wasn't born yesterday, you know - I've seen movies.",
  //  |       // ...
  //  | });
  //  |
  //  | // create an instance of the class and configure it
  //  | var b = new acme.Base({quip: "That's what it does!" });
  // example:
  //      copy in properties from multiple objects
  //  | var flattened = lang.mixin(
  //  |       {
  //  |           name: "Frylock",
  //  |           braces: true
  //  |       },
  //  |       {
  //  |           name: "Carl Brutanananadilewski"
  //  |       }
  //  | );
  //  |
  //  | // will print "Carl Brutanananadilewski"
  //  | console.log(flattened.name);
  //  | // will print "true"
  //  | console.log(flattened.braces);

  if(!dest){ dest = {}; }
  for(var i = 1, l = arguments.length; i < l; i++){
    lang._mixin(dest, arguments[i]);
  }
  return dest; // Object
},

extend = function(ctor, props){
  // summary:
  //      Adds all properties and methods of props to constructor's
  //      prototype, making them available to all instances created with
  //      constructor.
  // ctor: Object
  //      Target constructor to extend.
  // props: Object
  //      One or more objects to mix into ctor.prototype
  for(var i=1, l=arguments.length; i<l; i++){
    lang._mixin(ctor.prototype, arguments[i]);
  }
  return ctor; // Object
},

lang =  {
  isString:isString,
  isArray:isArray,
  isFunction:isFunction,
  isObject:isObject,
  isArrayLike:isArrayLike,
  hitch: hitch,
  replace: replace,
  split: split,
  extend: extend,
  _mixin: _mixin,
  mixin: mixin
};

module.exports = lang;
