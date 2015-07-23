var express = require("express");
var _ = require('underscore');
var jsonServer = require('json-server');
var path = require("path");
var dbFile = path.join(__dirname, "db.json");

var jsonServerRouter = null;

exports.init = function(router0, server){
    var auth = App.modules.auth;
    var router = express.Router();

    auth.interrupt(server, App.config.restful_prefix);

    router.use(jsonServer.defaults[1]);
    router.use(jsonServer.defaults[2]);
    router.use(jsonServer.defaults[3]);

    jsonServerRouter = jsonServer.router(dbFile);
    jsonServerRouter.render = function (req, res) {
        if(req.param("marked")==1){
            var hljs = require('highlight.js')
              , marked = require('marked')
              , data = res.locals.data;

            if(!data.body) return;

            marked.setOptions({
                gfm:true,
                anchors: true,
                pedantic:false,
                smartypants:true,
                // callback for code highlighter
                highlight:function (code, lang) {
                    var langs = {
                        js: "javascript"
                    };
                    try{
                        return hljs.highlight(langs[lang]?langs[lang]:lang, code).value;
                    }catch(e){
                        return hljs.highlightAuto(code).value;
                    }
                }
            });

            data.body = marked(data.body);
            res.json(data);
        }else{
            res.json(res.locals.data);
        }
    }

    router.use(jsonServerRouter);
    server.use(App.config.restful_prefix, router);

    exports.jsonServerRouter = jsonServerRouter;
};