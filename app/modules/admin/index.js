var path = require("path");

exports.init = function(router, server){
    var auth = App.modules.auth;
    var io = require('socket.io')(App.config.ioport);

    auth.interrupt(router,"admin");

    router.get("/admin", function(req,res,next){
        App.models.blog.all(
            parseInt(req.param("page") || 1),
            parseInt(req.param("count") || 10)
        ).then(function(data){
            res.render("admin", {
                data: data
            });
        });
    });

    router.get("/admin/blog", function(req,res,next){
        res.render("adminblog");
    });

    router.post("/admin/up", function(req,res,next){
        var file = req.files.file;
        if(!file) {
            var title = req.param("title");
            var body = req.param("body");

            if(!title || !body)
                return res.end("no file and no title and body");

            App.models.blog.create(title,body).then(function(saved){
                res.json(saved);
            });

            return;
        };
        App.tools.read_file(file.path).then(function(data){
            var title = path.basename(file.originalname, path.extname(file.originalname));
            var body  = data;

            App.models.blog.create(title,body).then(function(saved){
                res.json(saved);
            });
        }).catch(function(e){
            console.log(e);
            res.end();
        });
    });

    router.get("/admin/logger", function(req,res,next){
        res.render("adminlogger");
    });

    router.get("/admin/visitlog", function(req,res,next){
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