var path = require("path");

exports.init = function(server){
    var auth = App.modules.auth;

    auth.interrupt("admin");

    //routers
    server.get("/test",function(req, res){
        res.render("test");
    });

    server.get('/', function (req, res) {
        res.render('index', {
            title: 'Express'
        });
    });

    server.get('/home', function (req, res) {
        res.render('home');
    });

    server.get("/about-me", function(req,res){
        res.render("about-me");
    });

    server.get("/about-me/1", function(req,res){
        res.render("about-me-sec1");
    });

    server.get("/about-me/2", function(req,res){
        res.render("about-me-sec2");
    });

    server.get("/blog/parts/blog", function(req,res){
        res.render("blog");
    });

    server.get("/blog/parts/list", function(req,res){
        res.render("bloglist");
    });

    server.get("/blog/parts/one", function(req,res){
        res.render("blogone");
    });

    server.get("/download/:name.md", function (req, res, next) {

        App.models.blog.Blog.findOneQ({_id: req.params.name}).then(function(data){
            if(!data._id) return next();
            res.setHeader("Content-Type", "text/x-markdown");
            res.end(data.body);
        });

    });

    server.get("/admin", function(req,res,next){
        App.models.blog.all(
            parseInt(req.param("page") || 1),
            parseInt(req.param("count") || 10)
        ).then(function(data){
            res.render("admin", {
                data: data
            });
        });
    });

    server.get("/admin/blog", function(req,res,next){
        res.render("adminblog");
    });

    server.post("/admin/up", function(req,res,next){
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

}