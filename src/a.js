/*


 */

(function(root){

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root['A'] = factory();
    }

})(this, function() {

    var A = {

        define : function(appDef) {

            appDef = appDef || {};

            return (function(_appDef) {

                _appDef['api'] = _appDef.api || {};

                var newApp = function(config, bootstrapper, middleware) {
                    this._config = config;
                    this._container = [];
                    this._state = null;
                    this._bootstrapper = bootstrapper || null;
                    this._middleware = middleware || {};
                    this._hasRun = false;
                    this._initialize();
                };

                newApp.prototype = {

                    _component : _appDef.component,
                    _service : _appDef.services,

                    _initialize : function () {
                        //TODO middleware
                        this._state = (_appDef.api.createStore && _appDef.api.createStore) ? _appDef.api.createStore() : null;
                    },

                    _runMiddleWare : function(key, args) {
                        if (_appDef.middleware && _appDef.middleware[key]) {
                            _appDef.middleware[key].apply(this, args);
                        }
                        if (this._middleware[key]) {
                            this._middleware[key].apply(this, args);
                        }
                    },

                    mount : function(container) {
                        this._container.push(container);
                        this.renderElement(this.createElement(), container);
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

                    run: function() {
                        if (_appDef.bootstrapper) {
                            _appDef.bootstrapper.apply(this, arguments);
                        }
                        if (this._bootstrapper) {
                            this._bootstrapper.apply(this, arguments);
                        }
                    },

                    getConfig : function () {
                        return this._config;
                    },

                    setState : function(key, value) {
                        this._state.set(key, value);
                    },

                    getState : function (key) {
                        return this._state.get(key);
                    },

                    subscribe : function (key, callback) {
                        this._runMiddleWare('beforeSubscribe', [callback]);
                        this._state.subscribe(key, callback);
                        this._runMiddleWare('afterSubscribe', [callback]);
                    },

                    constructComponentStateObject : function() {
                        var self = this;
                        return (_appDef.api.constructComponentStateObject) ? _appDef.api.constructComponentStateObject(this.getState(), this.getConfig) : {state : this._state};
                    },

                    createElement : function () {
                        this._runMiddleWare('beforeCreateElement');
                        var newEl = (_appDef.api.createElement) ? _appDef.api.createElement(this._component, this.constructComponentStateObject()) : new this._component(this.constructComponentStateObject());
                        this._runMiddleWare('afterCreateElement', [newEl]);
                        return newEl;
                    },

                    renderElement : function(element, container) {
                        if (_appDef.api.renderElement) {
                            _appDef.api.renderElement(element, container);
                        } else {
                            container.appendChild(element.el);
                        }
                    },

                    getService : function(key) {
                        return (_appDef.api.getService) ? _appDef.api.getService(this._service, key) : this._service[key];
                    }

                };

                return newApp;

            })(appDef);

        }

    };

    return A;

});

