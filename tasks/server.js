module.exports = function (grunt) {

    //dependencies
    var marked = require('marked')
        , express = require('express')
        , Q = require("q")
        , _ = require("underscore");
    var http = require('http')
        , fs = require("fs")
        , url = require('url')
        , path = require("path");

    global.App = {};

    grunt.registerTask('server', 'Start the Site Server', function () {

        //keep the server running
        this.async();

        Q.fcall(function(){
            App.base_path = path.join(__dirname,"../");
            App.tools = {};
            App.tools.pager = require("./../app/tools/pager.js");
            App.tools.read_file = require("./../app/tools/read_file.js");
            App.tools.restfulmaker = require("./../app/tools/restfulmaker.js");
            App.paths = {
                app: {
                    modules: path.join(App.base_path, "app", "modules"),
                    models: path.join(App.base_path, "app", "models")
                }
            };
            App.modules = (function(){
                var paths = App.tools.read_file.sync(App.paths.app.modules)
                  , modules = {};

                paths.forEach(function(v,i){
                    var m = require(path.join(App.paths.app.modules, v));
                    m.name = v;
                    modules[v] = m;
                });

                return modules;
            })();
            App.models = (function(){
                var paths = App.tools.read_file.sync(App.paths.app.models)
                  , models = {};

                paths.forEach(function(v,i){
                    var m = require(path.join(App.paths.app.models, v));
                    m.name = v;
                    models[m.name] = m;
                });

                return models;
            })();
            App.config = {
                pkg: JSON.parse(App.tools.read_file.sync("package.json")),
                // server port, used to serve the site and run tests
                port: 5678,
                //restful prefix
                restful_prefix: "m",
                assets: {
                    js: {
                        jquery: 'assets/jquery/jquery.js',
                        "jquery-form": 'assets/jquery-form/jquery.form.js',
                        marked: 'assets/marked/lib/marked.js',
                        underscore: 'assets/underscore/underscore-min.js',
                        "underscore-min": 'assets/underscore/underscore-min.map',
                        angular: 'assets/angular/angular.js',
                        "angular-sanitize": 'assets/angular-sanitize/angular-sanitize.min.js',
                        "angular-sanitize.min.js": 'assets/angular-sanitize/angular-sanitize.min.js.map',
                        "angular-ui-router": 'assets/angular-ui-router/release/angular-ui-router.min.js',
                        "bootstrap-modal": "assets/bootstrap/js/bootstrap-modal.js",
                        "normalize": "assets/normalize/normalize.js",
                        "normalize-min": "assets/normalize/normalize.min.js"
                    },
                    css: {
                        bootstrap: 'assets/bootstrap/docs/assets/css/bootstrap.css'
                    },
                    img: {
                        "glyphicons-halflings": 'assets/bootstrap/img/glyphicons-halflings.png',
                        "glyphicons-halflings-white": 'assets/bootstrap/img/glyphicons-halflings-white.png'
                    }
                }
            };
        }).then(function(){
            var tools = App.tools
              , config = App.config
              , base_path = App.base_path
              , server = express()
              , router = express.Router();

            var favicon = require('serve-favicon');
            var logger = require('morgan');
            var methodOverride = require('method-override');
            var session = require('express-session');
            var bodyParser = require('body-parser');
            var multer = require('multer');
            var errorHandler = require('errorhandler');

            server.set('port', config.port);
            server.set('views', path.join(base_path, 'build', 'local', 'tmpl'));
            server.set('view engine', 'jade');
            server.use(express.static(path.join(base_path, 'build', 'public')));
            server.use(logger('dev'));
            server.use(methodOverride());
            server.use(bodyParser.json());
            server.use(bodyParser.urlencoded({ extended: true }));
            server.use(multer());
            server.use(session({
                resave: true,
                saveUninitialized: true,
                secret: "fawd"
            }));
            server.use(errorHandler({
                dumpExceptions: false,
                showStack: false
            }));

            server.locals = {
                pkg: config.pkg,
                angular_module_name: config.pkg.name,
                csslib: function(filename){
                    return "/assets/css/"+filename+".css";
                },
                jslib: function(filename){
                    return "/assets/js/"+filename+".js";
                },
                css: function(filename){
                    return "/css/"+filename+".css";
                },
                js: function(filename){
                    return "/js/"+filename+".js";
                }
            };

            server.use(function(req, res, next){
                res.locals.req = req;
                res.locals.res = res;
                next();
            });

            router.get("/assets/:filetype/:filename.:fileext",function(req,res){
                var etag = req.header("If-None-Match");
                var filename = req.param("filename")
                  , filetype = req.param("filetype");

                var filenames = filename.split(",");

                if(filenames.length==1)
                try{
                    res.sendFile(path.join(base_path,config.assets[filetype][filename]));
                }catch (e){
                    res.status(404).end();
                }
                else {
                    var ds = [];
                    filenames.forEach(function (v, i) {
                        if(config.assets[filetype][v])
                        ds.push(tools.read_file(path.join(base_path,config.assets[filetype][v])));
                    });
                    Q.spread(ds, function(){
                        [].forEach.call(arguments,function(v,i){
                            ds[i] = v;
                        });
                        var rbody = ds.join("\n");
                        var crypto = require('crypto');
                        var shasum = crypto.createHash('sha1');
                        shasum.update(rbody);
                        var sha1 = shasum.digest('hex');
                        if(etag == sha1){
                            res.status(304)
                            res.end();
                        }else{
                            res.set({
                                'ETag': sha1
                            })
                            res.end(rbody);
                        }
                    });
                }

            });

            _.each(App.modules, function(v,k){
                //laod module
                v.init(router);
            });

            _.each(App.models, function(v,k){
                //makerestful for every model
                tools.restfulmaker(k,v,router);
            });

            server.use(router);
            server.use(function(req,res){
                res.status(404).render("404",{
                    routes: []
                });
            });

            http.createServer(server).listen(config.port, function () {
                console.log("Express server listening on port " + config.port);
            });
        }).fail(function (error) {
            console.error(error.stack);
        });
    });
};