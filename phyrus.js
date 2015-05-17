/**
 * phyrus.js v1.0.0
 * a JavaScript library to make ajax request
 * with XMLHttpRequest 2 and upload files easily.
 *
 * Copyright (c) 2015 Yail Peralta <yailperalta@phyrus.net>
 * Open source under the MIT License.
 * https://github.com/yailPeralta/phyrus/blob/master/LICENSE
 */

(function (global) {
    'use strict';

    var
        phyrus  = global.phyrus || {},

        version = "1.0",

        // private helpers
        _isArray = function ( thing ){
            return thing && (thing instanceof Array || typeof thing == "array");
        },

        _isDefined = function( thing ){
           return typeof thing !== 'undefined';
        },

        _isObject = function ( thing ) {
            return typeof thing === "object";
        },

        _isFunction = function ( thing ) {
            return typeof thing === "function";
        },

        _isString =  function (thing) {
            return typeof thing === 'string';
        },

        _isNumber  = function (thing) {
            return typeof thing === 'number';
        },

        _isBool = function (thing) {
            return typeof thing === 'boolean';
        },

        _isFileList = function( thing ){
            return thing instanceof FileList;
        },

        _contains  = function (array, target) {
            return indexOf(array, target) !== -1;
        },

        _mergeOptions = function (options, defaultOptions) {

            if(_isFunction(Object.assign)){
                // use EcmaScript 6
                return Object.assign({}, defaultOptions, options);
            }

            for (var attr in defaultOptions) {
                if(defaultOptions.hasOwnProperty(attr)){
                    if( !_isDefined(options[attr]) ){
                        options[attr] = defaultOptions[attr];
                    }
                }
            }
            return options;
        };

    /**
     *
     * @returns {{request: Function}}
     */
    phyrus.ajax = function (url) {

        var
            // the XmlHttpRequest object
            XHR,

            // the url to which the request is sent, default the current page
            targetUrl = (_isDefined(url) && _isString(url) && url !== '') ? url : global.location.href,

            // the domain to which the request is sent
            targetDomain = (targetUrl && targetUrl.toLowerCase().split('/')[2]) ? targetUrl.toLowerCase().split('/')[2] : null,

            // the domain where the app using this script is
            ownDomain = global.location.host,

            /**
             *
             * @param method
             * @param url
             * @param async
             * @returns {XMLHttpRequest}
             */
            createRequest = function (method, url, async) {
                // Instance XMLHttpRequest
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, async);

                return xhr;
            },

            /**
             *
             * @param method
             * @param url
             * @returns {XMLHttpRequest}
             */
            createCORSRequest = function (method, url) {

                var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {

                    // Check if the XMLHttpRequest object has a "withCredentials" property.
                    // "withCredentials" only exists on XMLHTTPRequest2 objects.
                    xhr.open(method, url, true);

                } else if (_isDefined(XDomainRequest)) {

                    // Otherwise, check if XDomainRequest.
                    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                    xhr = new XDomainRequest();
                    xhr.open(method, url);

                } else {

                    // Otherwise, CORS is not supported by the browser.
                    xhr = null;

                }
                return xhr;
            };

        // return ajax object
        return {

            request: function () {
                var
                    // defaults options
                    defaultOptions = {
                        method: 'GET',
                        data: null,
                        url: targetUrl,
                        async: true,
                        //text, arraybuffer, blob o document
                        responseType: 'text',
                        contentType: "application/x-www-form-urlencoded"
                    },

                    // custom options for ajax request,
                    options = ( _isObject(arguments[0]) )
                        // if it's an object, combine both objects
                        ? _mergeOptions(arguments[0],defaultOptions)
                        // else default option are used
                        : defaultOptions,

                    // pomise object
                    promise;

                // if method get append the data to the url
                if (options.data && (options.method.toUpperCase() === 'GET')) {
                    options.url += '?';
                    var argCount = 0;
                    for (var key in options.data) {
                        if (options.data.hasOwnProperty(key)) {
                            if (argCount++) {
                                options.url += '&';
                            }
                            options.url += encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]);
                        }
                    }

                    options.data = null;
                // otherwise
                }else if(options.data && (options.method.toUpperCase() === 'POST')
                    || (options.method.toUpperCase() === 'PUT')){

                    if(!(options.data instanceof FormData)){

                        var formData = new FormData();

                        for (var p in options.data) {
                            if (options.data.hasOwnProperty(p)) {
                                formData.append(p + '', options.data[p]);
                            }
                        }

                        options.data = formData;

                    }

                }

                // Create a promise
                promise = new Promise( function (resolve, reject) {

                    try {
                        // if the own domain and target
                        // domain are not equal then it is a cross domain request
                        if (targetDomain && ownDomain !== targetDomain) {
                            XHR = createCORSRequest('GET', options.url);
                            console.log(ownDomain + ' ---> ' + targetDomain);

                            if (!XHR) {
                                throw {
                                    name: "CORSError",
                                    message: "CORS is not supported!"
                                }
                            }

                        } else {
                            XHR = createRequest(options.method, options.url, options.async || true );

                            if (!XHR) {
                                throw {
                                    name: "XMLHttpRequestError",
                                    message: "XMLHttpRequest is not supported!"
                                }
                            }
                        }
                    }catch(e){
                        // log the error
                        console.error(e.message);
                    }

                    // fill the options
                    XHR.responseType = options.responseType;
                    XHR.contentType  = options.contentType;

                    console.log(options.data);
                    // send the request
                    XHR.send(options.data);

                    // events listeners
                    XHR.addEventListener('load', function () {
                        if(this.readyState == 4){
                            if (this.status == 200) {
                                // Realiza la función "resolver" cuando this.status es igual a 200
                                resolve(this.response);
                            } else {
                                // Realiza la función "rechazar" when this.status es diferente de 200
                                reject(this.statusText);
                            }
                        }
                    });

                    XHR.addEventListener('error', function () {
                        reject(this.statusText);
                    });

                    if(_isFunction(options.progressCallback)){

                        XHR.upload.addEventListener('progress', options.progressCallback);
                    }

                }); //end Promise

                return promise;
            }
        }
    };


    /**
     *
     * @returns {{into: Function}}
     */
    phyrus.uploadFiles = function () {
        var
            self = this,

            files,

            firstArg = arguments[0],

            // custom options
            options,

            // defaults options
            defaultOptions =  {
                method: "POST",
                contentType: "multipart/form-data",
                progressCallback: function (e) {
                    // Listen to the upload progress.
                    var progressBar = document.querySelector('progress');

                    if (e.lengthComputable) {
                        progressBar.value = (e.loaded / e.total) * 100;
                        progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
                    }
                }
            },

            /**
             *
             * @param files
             * @param url
             * @param options
             * @returns {*}
             */
            sendFiles = function (files, url, options) {

                var formData = new FormData();

                for (var i = 0, file; file = files[i]; ++i) {
                    formData.append("file_" + i, file);
                }

                options.data = formData;

                var ajaxObj = self.ajax(url);

                // request options
                return ajaxObj.request(options);
            };


        // if use a simple input file
        if(_isFileList(firstArg)){
            // get the files
            files = firstArg;
        }

        // if the argument is an obj literal
        if(_isObject(firstArg)){

            // combine both objects
            options = _mergeOptions(firstArg, defaultOptions);

        // else use default options
        }else{
            options = defaultOptions;
        }


        // return uploadFiles object
        return {

            into: function (url) {

                if (_isString(url) && url !== '') {

                    if (_isDefined(files)) {

                        return sendFiles(files, url, options);

                    } else {

                        var inputFile = document.querySelector('input[data-uploadfiles]');

                        try {

                            inputFile
                                .addEventListener('change', function (e) {
                                    var files = e.target.files;

                                    var promise = sendFiles(files, url, options);

                                    promise
                                        // promises
                                        .then(function (response) {
                                            //console.log('success uploading the files!');

                                            if (_isDefined(options.success) && _isFunction(options.success)) {
                                                // call success callback
                                                options.success(response);
                                            }

                                        })
                                        .catch(function (response) {
                                            console.log('Error: ' + response);

                                            if (_isDefined(options.error) && _isFunction(options.error)) {
                                                // call success callback
                                                options.error(response);
                                            }
                                        });

                                }, false);

                        } catch (e) {
                            console.error("Error: there is no input type file with data-uploadfiles attribute in the document!");
                            return false;
                        }

                    }

                } else {
                    console.error("Error: the url is mandatory!");
                }
            }
        }
    }; // end upload files

    // Register as a named AMD module.
    if ( typeof global.define === "function" && global.define.amd ) {
        global.define( "phyrus", [], function() {
            return phyrus;
        });
    }

    phyrus.version = version;

    // exposes into the global obj
    global.phyrus =  global.p = phyrus;

})(window);
