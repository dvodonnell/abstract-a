/*


 */

(function(root, factory){

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root['A'] = factory();
    }

})(this, function() {

    if (typeof Object.assign != 'function') {
        (function () {
            Object.assign = function (target) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }

    var A = {

        define : function(appDef) {

            appDef = appDef || {};

            return (function(_appDef) {

                _appDef['api'] = _appDef.api || {};
                _appDef['config'] = _appDef.config || {};

                var newApp = function(config, envService, bootstrapper, middleware) {
                    this._config = Object.assign({}, _appDef.config, config || {});
                    this._container = [];
                    this._connections = {};
                    this._store = null;
                    this._bootstrapper = bootstrapper || null;
                    this._middleware = middleware || {};
                    this._envService = envService;
                    this._initialize();
                };

                newApp.prototype = {

                    _service : _appDef.services,
                    _action : _appDef.actions,

                    _initialize : function () {
                        this._store = (_appDef.api.storeInitializer && _appDef.api.storeInitializer) ? _appDef.api.storeInitializer() : null;
                    },

                    _runMiddleWare : function(key, args) {
                        if (_appDef.middleware && _appDef.middleware[key]) {
                            _appDef.middleware[key].apply(this, args);
                        }
                        if (this._middleware[key]) {
                            this._middleware[key].apply(this, args);
                        }
                    },

                    _render : function() {
                        if (_appDef.api.renderer) {
                            _appDef.api.renderer.apply(this, arguments);
                        }
                    },

                    run : function() {
                        if (_appDef.api.runner) {
                            _appDef.api.runner.apply(this, arguments);
                        }
                        if (this._bootstrapper) {
                            this._bootstrapper.apply(this, arguments);
                        }
                    },

                    mount : function(container) {
                        this._container.push(container);
                        this._render(container);
                    },

                    unmount : function() {
                        if (_appDef.api.unmount) {
                            _appDef.api.unmount(this._container);
                        } else {
                            while (this._container.firstChild) {
                                this._container.removeChild(this._container.firstChild);
                            }
                        }
                    },

                    getConfig : function () {
                        return this._config;
                    },

                    setData : function(key, value) {
                        this._store.set(key, value);
                    },

                    getData : function (key) {
                        return this._store.get(key);
                    },

                    getStore : function() {
                        return this._store;
                    },

                    subscribe : function (key, callback) {
                        this._runMiddleWare('beforeSubscribe', [callback]);
                        this._store.subscribe(key, callback);
                        this._runMiddleWare('afterSubscribe', [callback]);
                    },

                    getService : function(key) {
                        return _appDef.services[key];
                    },

                    getServices : function() {
                        return _appDef.services;
                    },

                    createConnection : function(key, config, instanceKey) {
                        var conn = new _appDef.connections[key](config);
                        this._connections[instanceKey || key] = conn;
                        return conn;
                    },

                    getConnection : function(key) {
                        return this._connections[key];
                    },

                    getEnvironmentService : function() {
                        return this._envService;
                    },

                    createAction : function(key, args) {
                        return this._action[key].apply(this, args);
                    },

                    getActions : function() {
                        return this._action;
                    },

                    getAction : function(key) {
                        return this._action[key];
                    }

                };

                return newApp;

            })(appDef);

        }

    };

    return A;

});

