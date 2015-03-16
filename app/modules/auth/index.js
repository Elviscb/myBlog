var _ = require("underscore");
var Q = require("q");
var path = require("path");
var administrator_file = path.join(__dirname, "administrator.json");
var _server;

exports.init = function(server){
    var i18n = App.modules.i18n;
    _server = server;

    _server.get("/auth",function(req,res){
        var red = req.param("red");
        if(!red) red = "";
        if(red.trim()=="") red = "/admin";
        res.render("auth",{
            red: encodeURIComponent(red)
        });
    });

    _server.post("/login",function(req,res){
        var red = req.param("red")
          , name = req.param("name")
          , passwd = req.param("passwd");
        App.tools.read_file(administrator_file).then(function(data){
            return veri(name, passwd, data);
        }).then(function(v){
            req.session.user = v;
            res.redirect(decodeURIComponent(red));
        }).fail(function(error){
            //失败
            console.log(error);
            res.render("auth",{
                red: red,
                error: error,
                name: name
            });
        });
    });

    _server.get("/logout",function(req,res){
        req.session.user = null;
        res.redirect("/auth");
    });

    function veri(name, passwd, data){
        var name_exist = false;
        return Q.promise(function(resolve, reject, notify){
            _.each(JSON.parse(data),function(v,i){
                if(v.name == name){
                    name_exist = true;
                    if(v.passwd == passwd){
                        resolve(v);
                    }
                    reject(i18n.docs.wrong_passwd);
                }
            });
            if(!name_exist)
                reject(i18n.docs.name_not_found);
        });
    }
};

exports.interrupt = function(name){
    _server.use("/" + name,function(req,res,next){
        //if(req.session.user){
            next();
        //}else{
        //    res.redirect("/auth?red="+req.originalUrl);
        //}
    });
};