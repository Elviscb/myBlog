var _ = require("underscore");
var Q = require("q");
var path = require("path");
var fs = require('fs');
var moment = require('moment');
var utils = require('./utils');

exports.init = function(router, server){
    var i18n = App.modules.i18n;
    var logger = App.modules.logger;
    var db = App.modules.Arestful.jsonServerRouter.db;

    router.get("/", function(req, res, next){
        req.redi = decodeURIComponent(req.param("red") || "/admin");
        next();
    }, function(req, res, next){
        var ru = req.cookies["remember-user"];
        var rt = req.cookies["remember-token"];
        if(ru && rt){
            if(!db("user").find(function(v,i){
                    if(consumeToken(req, res, v, ru, rt)) {
                        req.session.user = v;
                        res.redirect(req.redi);
                        return true;
                    }else return false;
                })) next();
        } else next();
    }, function(req,res){
        res.render("auth",{
            red: encodeURIComponent(req.redi)
        });
    });

    router.post("/login",function(req,res){
        var red = req.param("red")
          , name = req.param("name")
          , passwd = req.param("passwd")
          , rememberme = req.param("remember-me") == "on";
        veri(name, passwd, db).then(function(v){
            //如果勾选了自动登录,生成token
            if(rememberme) issueToken(req, res, v, go); else go();
            function go(){
                req.session.user = v.value();
                res.redirect(decodeURIComponent(red));
            }
        }).fail(function(error){
            res.render("auth",{
                red: red,
                error: error,
                name: name
            });
        });
    });

    router.get("/logout",function(req,res){
        var ouser = req.session.user;
        if(!ouser) return res.redirect("/auth");

        //删除remember-token
        db("user").chain().find({
            id: ouser.id
        }).assign({
            "remember-token": null,
            "remember-token-expired-in": null
        }).value();

        res.cookie('remember-token', "", { path: '/', httpOnly: true, maxAge: 0 });
        res.redirect("/auth");

        req.session.user = null;
    });

    function veri(name, passwd, db){
        //验证登录
        var data = null;
        return Q.promise(function(resolve, reject, notify){
            if(!db("user").find({
                    name: name
                })){
                reject(i18n.docs.name_not_found);
            }
            else{
                data = db("user").chain().find({
                    name: name,
                    passwd: passwd
                });
                if(!data.value()){
                    reject(i18n.docs.wrong_passwd);
                }else resolve(data);
            }
        });
    }

    function issueToken(req, res, user, cb){
        //生成一个remember-token保存到文件和cookie中
        var token = utils.randomString(64);
        var user_value = user.assign({
            "remember-token": token,
            "remember-token-expired-in": moment().unix() + 604800
        }).value();

        res.cookie('remember-user', user_value.name, { path: '/', httpOnly: true, maxAge: 1000  * 60 * 60 * 24 * 30 });
        res.cookie('remember-token', token, { path: '/', httpOnly: true, maxAge: 1000  * 60 * 60 * 24 * 7});
        cb();
    }

    function consumeToken(req, res, user, ru, rt){
        //验证自动登录
        if(
            user.name == ru &&
            user["remember-token"] == rt &&
            user["remember-token-expired-in"] > moment().unix()
        ){
            return true;
        }
    }
};

exports.interrupt = function(server,name,methods){
    if(!methods) methods = ["get","put","post","delete"];
    server.use(name,function(req,res,next){
        if(!_.find(methods, function(v,i){
           if(v.toLowerCase() == req.method.toLowerCase() && !req.session.user){
               res.redirect("/auth?red="+encodeURIComponent(req.originalUrl));
               return true;
           }
        })){
            next();
        };
    });
};