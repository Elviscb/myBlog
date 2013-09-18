module.exports = function (grunt) {

    'use strict';

    //dependencies
    var express = require('express')
      , Resource = require('express-resource')
      , Q = require("q")
      , http = require('http')
      , marked = require('marked')
      , fs = require("fs")
      , url = require('url')
      , path = require("path")
      , read_file = require("./../app/read_file")();

    //models
    var BlogResource = require("./../app/model/blog");

    //add to task
    grunt.registerTask('server', 'Start the Site Server', function () {

        //keep the server running
        this.async();

        var app = express()
          , rootdir = path.join(__dirname, "..")
          , config = {
                port: process.env.PORT||3000
            };

        process.argv.forEach(function(v, i, a){
            var ev = v.split("=");
            config[ev[0]] = ev[1] || "";
        });

        app.configure(function () {
            app.set('port', config.port);
            app.set('views', path.join(rootdir, 'build', 'local'));
            app.set('view engine', 'jade');
            app.use(express.static(path.join(rootdir, 'build', 'public')));
            app.use(express.logger('dev'));
            app.use(express.bodyParser());
            app.use(express.methodOverride());
//            app.use(lessMiddleware({
//                src: __dirname + '/public',
//                compress: true
//            }));

            app.locals({
                title: "Elvis"
            });

            //request level locals
            app.use(function(req, res, next){
                res.locals.req = req;
                res.locals.res = res;
                next();
            });

            app.use(app.router);

            app.use(function(req,res){
                res.status(404).render("404",{
                    routes: app.routes
                });
            });
        });

        //param
        /*
        require('express-params').extend(app);
        app.param("blog", /^[0-9a-f]{24}$/i);
        */

        //restful
        app.resource('blog', BlogResource);

        //routers
        app.get("/test",function(req, res){
            res.render("test");
        });

        app.get('/', function (req, res) {
            res.render('index', {
                title: 'Express'
            });
        });

        app.get('/about-me', function (req, res) {
            res.render('about-me');
        });

        app.get('/about-me/sec1', function (req, res) {
            res.render('about-me-sec1');
        });

        app.get('/about-me/sec2', function (req, res) {
            res.render('about-me-sec2');
        });

        app.get("/download/:name.md", function (req, res, next) {

            BlogResource.Blog.findOneQ({_id: req.params.name}).then(function(data){
                if(!data._id) return next();
                res.setHeader("Content-Type", "text/x-markdown");
                res.end(data.body);
            }).fail(function(err){
                next(err);
            });

        })

        //admin
        require("./../app/modules/admin")(app);

        //auth
        require("./../app/modules/auth")(app);

        app.configure('development', function () {
            app.use(express.errorHandler({
                dumpExceptions: true,
                showStack: false
            }));
        });

        http.createServer(app).listen(config.port, function () {
            console.log("Express server listening on port " + config.port);
        });

    });
};