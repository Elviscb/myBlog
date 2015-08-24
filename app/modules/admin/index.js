var path = require("path");

exports.init = function(router, server){
    var auth = App.modules.auth;
    var io = require('socket.io')(App.config.ioport);

    auth.interrupt(router,"/");

    router.get("/", function(req,res,next){
        res.render("admin", {

        });
    });

    router.get("/blog", function(req,res,next){
        res.render("adminblog");
    });

    router.get("/blog-list", function(req,res,next){
        res.render("adminbloglist");
    });

    router.get("/blog-create", function(req,res,next){
        res.render("adminblogcreate");
    });

    router.get("/logger", function(req,res,next){
        res.render("adminlogger");
    });

    router.get("/user", function(req,res,next){
        res.render("adminuser");
    });

    router.get("/user-list", function(req,res,next){
        res.render("adminuserlist");
    });

    router.get("/user-create", function(req,res,next){
        res.render("adminusercreate");
    });

    router.get("/visitlog", function(req,res,next){
        App.tools.read_file(App.modules.logger.visitLogFile).then(function(data){
            res.jsonOk(data);
        }).fail(function(err){
            res.jsonError(err);
        });
    });



    /*
    var visitLogSteam = fs.createReadStream(App.modules.logger.visitLogFile, {
        encoding: 'utf8',
        autoClose: true
    });
    io.on("connection", function(socket){
        visitLogSteam.on("data", function(chunk){
            io.emit(chunk);
        });
    });
    */
}