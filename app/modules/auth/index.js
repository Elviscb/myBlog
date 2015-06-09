var _ = require("underscore");
var Q = require("q");
var path = require("path");
var fs = require('fs');
var moment = require('moment');
var utils = require('./utils');
var administrator_file = path.join(__dirname, "administrator.json");

exports.init = function(router, server){
    var i18n = App.modules.i18n;
    var logger = App.modules.logger;

    router.get("/auth", function(req, res, next){
        req.redi = req.param("red") || "/admin";
        next();
    }, function(req, res, next){
        var ru = req.cookies["remember-user"];
        var rt = req.cookies["remember-token"];
        if(ru && rt)
            App.tools.read_file(administrator_file).then(function(data){
                if(!_.find(JSON.parse(data),function(v,i){
                    if(consumeToken(req, res, v, ru, rt)) {
                        req.session.user = v;
                        res.redirect(req.redi);
                        return true;
                    }
                })) next();
            });
        else next();
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
        App.tools.read_file(administrator_file).then(function(data){
            return veri(name, passwd, data);
        }).then(function(v){
            //如果勾选了自动登录,生成token
            if(rememberme) issueToken(req, res, v[0], v[1], go); else go();
            function go(){
                req.session.user = v[0];
                res.redirect(decodeURIComponent(red));
            }
        }).fail(function(error){
            logger(req, res, error.stack);
            res.render("auth",{
                red: red,
                error: "something wrong...",
                name: name
            });
        });
    });

    router.get("/logout",function(req,res){
        var ouser = req.session.user;
        //删除remember-token
        App.tools.read_file(administrator_file).then(function(data){
            var _data = JSON.parse(data);
            for(var i in _data){
                if(_data[i].name == ouser.name){
                    delete _data[i]["remember-token"];
                    delete _data[i]["remember-token-expired-in"];
                }
            }
            fs.writeFile(administrator_file, JSON.stringify(_data), function(err){
                if(err){
                    logger(req, res, err);
                }else{
                    res.cookie('remember-token', "", { path: '/', httpOnly: true, maxAge: 0 });
                    res.redirect("/auth");
                }
            });

        });
        req.session.user = null;
    });

    function veri(name, passwd, data){
        //验证登录
        var name_exist = false;
        return Q.promise(function(resolve, reject, notify){
            _.each(JSON.parse(data),function(v,i){
                if(v.name == name){
                    name_exist = true;
                    if(v.passwd == passwd){
                        resolve([v, data]);
                    }
                    reject(i18n.docs.wrong_passwd);
                }
            });
            if(!name_exist)
                reject(i18n.docs.name_not_found);
        });
    }

    function issueToken(req, res, user, data, cb){
        //生成一个remember-token保存到文件和cookie中
        var _data = JSON.parse(data);
        var token = utils.randomString(64);
        for(var i in _data){
            if(_data[i].name == user.name){
                _data[i]["remember-token"] = token;
                _data[i]["remember-token-expired-in"] = moment().unix() + 604800;
            }
        }
        fs.writeFile(administrator_file, JSON.stringify(_data), function(err){
            if(err){
                logger(req, res, err);
            }else{
                res.cookie('remember-user', user.name, { path: '/', httpOnly: true, maxAge: 1000  * 60 * 60 * 24 * 30 });
                res.cookie('remember-token', token, { path: '/', httpOnly: true, maxAge: 1000  * 60 * 60 * 24 * 7});
            }
            cb();
        });
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

exports.interrupt = function(server,name){
    server.use("/" + name,function(req,res,next){
        if(req.session.user){
            next();
        }else{
            res.redirect("/auth?red="+req.originalUrl);
        }
    });
};