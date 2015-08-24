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
            App.paths = {
                app: {
                    modules: path.join(App.base_path, "app", "modules"),
                    tools: path.join(App.base_path, "app", "tools")
                }
            };
            App.tools = (function(){
                var paths = fs.readdirSync(App.paths.app.tools)
                  , tools = {};

                paths.forEach(function(v,i){
                    var m = require(path.join(App.paths.app.tools, v));
                    v = v.match(/[^\.]+/)[0];
                    m.name = v;
                    tools[v] = m;
                });

                return tools;
            })();
            App.config = _.extend(JSON.parse(App.tools.read_file.sync(path.join(App.base_path,"config.json")).toString()), {
                pkg: JSON.parse(App.tools.read_file.sync(path.join(App.base_path,"package.json")).toString()),
                public_dir: path.join(App.base_path, 'build', 'public'),
                assets_dir: path.join(App.base_path, 'assets')
            });
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
        }).then(function(){
            var tools = App.tools
              , config = App.config
              , base_path = App.base_path
              , server = express()
              , router = express.Router();

            var favicon = require('serve-favicon');
            var methodOverride = require('method-override');
            var session = require('express-session');
            var cookieParser = require('cookie-parser');
            var bodyParser = require('body-parser');
            var multer = require('multer');

            server.set('port', config.port);
            server.set('views', path.join(base_path, 'build', 'local', 'tmpl'));
            server.set('view engine', 'jade');
            server.use(express.static(config.public_dir));
            server.use(express.static(config.assets_dir));
            server.use(methodOverride());
            server.use(cookieParser());
            server.use(bodyParser.json());
            server.use(bodyParser.urlencoded({ extended: true }));
            server.use(multer());
            server.use(session({
                resave: true,
                saveUninitialized: true,
                secret: "fawd"
            }));

            server.locals = {
                pkg: config.pkg,
                angular_module_name: config.pkg.name,
                restful_prefix: config.restful_prefix,
                css: function(filename){
                    return "/" + (config.assets["css"][filename] || filename + ".css");
                },
                js: function(filename){
                    return "/" + (config.assets["js"][filename] || filename + ".js");
                }
            };

            server.use(function(req, res, next){
                res.locals.req = req;
                res.locals.res = res;
                res.jsonOk = function(result){
                    res.json({
                        result: result
                    });
                    res.end();
                };
                res.jsonError = function(error){
                    res.json({
                        error: error
                    });
                    res.end();
                };
                next();
            });

            _.each(App.modules, function(v,k){
                var router_sub = express.Router();
                //laod module
                v.init(router_sub, server);
                if(k == "core"){
                    server.use(router_sub);
                }else server.use("/" + k, router_sub);
            });

            server.use(router);
            server.use(function(req,res){
                res.status(404).render("404",{
                    routes: []
                });
            });
            server.use(function(err, req, res, next){
                App.modules.logger.error(req, res, err);
                res.status(500).render("500", {
                    stack: err.stack
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