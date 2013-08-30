module.exports = function (grunt) {

    'use strict';

    var express = require('express')
      , http = require('http')
      , highlighter = require('highlight.js')
      , marked = require('marked')
      , url = require('url')
      , path = require("path")
      , read_file = require("./read_file")();

    grunt.registerTask('server', 'Start the Site Server', function () {

        //keep the server running
        this.async();

        var app = express()
          , rootdir = path.join(__dirname, "..");

        app.get('/test', function (req, res) {
            res.render("test",
                {
                    title: "test"
                });
        });

        var port = process.env.PORT || grunt.config.get('server_port');
        // update server port for later use if needed
        grunt.config('server_port', port);

        app.configure(function () {
            grunt.log.ok(path.join(rootdir, 'src', 'tmpl'));
            app.set('port', port);
            app.set('views', path.join(rootdir, 'src', 'tmpl'));
            app.set('view engine', 'jade');
            app.use(express.logger('dev'));
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(app.router);
//            app.use(lessMiddleware({
//                src: __dirname + '/public',
//                compress: true
//            }));
            app.use(express.static(path.join(rootdir, 'build')));
            app.use(express.errorHandler({
                dumpExceptions: false,
                showStack: false
            }));
        });

        //routers
        app.get('/', function (req, res) {
            res.render('index', {
                title: 'Express',
                url: "/"
            });
        });

        app.get('/about-me', function (req, res) {
            res.render('about-me', {
                title: 'Elvis',
                url: "/about-me"
            });
        });

        app.get('/about-me/sec1', function (req, res) {
            res.render('about-me-sec1', {
                title: 'Elvis',
                url: "/about-me"
            });
        });

        app.get('/about-me/sec2', function (req, res) {
            res.render('about-me-sec2', {
                title: 'Elvis',
                url: "/about-me"
            });
        });

        //articles
        app.get("/articles*", function (req, res) {
            var pathname = decodeURI(url.parse(req.url).pathname), menu_loc = "/articles";
            var realPath = pathname.substring(1);
            if (!path.extname(realPath) && realPath[realPath.length - 1] !== "/")
                res.redirect(pathname += "/");
            else read_file(realPath).then(function (data) {
                if (!data) {
                    //console.log("Can't find file:"+realPath);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });

                    res.write("This request URL " + pathname + " was not found on this server.");

                    return res.end();
                } else {
                    if (data instanceof Array) {
                        res.render("article/list", {
                            title: pathname,
                            url: menu_loc,
                            files: data
                        });
                    } else {
                    	
                    	marked.setOptions({
                            gfm:true,
                            anchors: true,
//                            base: "/",
                            pedantic:false,
                            smartypants:true,
//                            sanitize:true,
                            // callback for code highlighter
                        highlight:function (code, lang) {
                            try{
                                return highlighter.highlight(lang, code).value;
                            }catch(e){
                                return highlighter.highlightAuto(code).value;
                            }
                        }
                        });
                    	
                        var text=marked(data.toString())
                          , locs, locsAll = [];
                        
//                        s = markdown.parse(data.toString());
//                        for (var i in s) {
//                            t = s[i];
//                            if (t instanceof Array && t[0] == "header") {
//                                if (t[1]["level"] < 3)
//                                    menus.push([ t[1]["id"], t[2] ]);
//                            }
//                        }
//                        text = markdown.toHTML(s);

                        locs = realPath.split("/");
                        while (locs.length) {
                            locsAll.push("/" + locs.join("/"), locs.pop());
                        }

                        read_file(realPath.substring(0,realPath.lastIndexOf("/"))).then(function(files){
                            res.render("article/article", {
                                url: menu_loc,
                                menus: files,
                                locsAll: locsAll,
                                article: {
                                    name: locsAll[1].replace(/\.[^.]*$/g,""),
                                    text: text,
                                    code: data
                                },
                                title: req.params.article
                            });
                        }).done();

                    }
                }
            }).fail(function(err){
            	res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                console.log(err);
                return res.end(err + "");
            });
        });

        //back
        app.get("/administer", function (req, res) {
            res.redirect("/administer/articles");
        });
        app.get("/administer/articles", function (req, res) {
            res.render("administer", {
                nodeId: req.param("node") || ""
            });
        });
        app.post("/administer/articles", function (req, res) {
            var pathname = decodeURI("articles" + (req.param("node") || ""));

            fs.stat(pathname, function (err, stat) {
                if (err) res.send(500, console.log(err) || "");
                else if (stat.isFile()) {
                    fs.writeFile(pathname, req.param("data"), function (err) {
                        if (err) res.send(500, console.log(err) || "");
                        else res.send(200, "saved");
                    });
                } else res.send(400, "wrong file dir");
            });
        });
        app.get("/administer/articles.json", function (req, res) {

            var pathname = decodeURI("articles" + (req.param("node") || ""));

            read_file(pathname, function (err, exists, dir, data) {

                if (!dir)
                    return res.send(200, data);

                var r = [], count = 0;
                for (var i in data) {

                    (function () {
                        var index = i,
                            name = data[index],
                            id = (req.param("node") || "") + "/" + name;

                        fs.stat(pathname + "/" + name, function (err, stat) {
                            if (err) res.send(500, console.log(err) || "");
                            else if (stat.isFile()) name = "<a class='article' node='" + id + "' href='?node=" + id + "'>" + name + "</a>";

                            r[index] = {
                                label: name,
                                id: id
                            };

                            if (stat.isFile()) r[index].children = [];
                            else r[index].load_on_demand = true;

                            if (++count == data.length)
                                res.json(r);
                        });

                    })();
                }
            });
        });

        //auth
        app.get("/auth", function (req, res) {
            res.render("auth/login", {

            });
        });

        app.configure('development', function () {
            app.use(express.errorHandler());
        });

        http.createServer(app).listen(app.get('port'), function () {
            console.log("Express server listening on port " + app.get('port'));
        });

    });
};