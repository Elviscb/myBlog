var path = require("path");

exports.init = function(router, server){
    var auth = App.modules.auth;

    //routers
    router.get("/test",function(req, res){
        res.render("test");
    });

    router.get('/', function (req, res) {
        res.render('index', {
            title: 'Express'
        });
    });

    router.get('/home', function (req, res) {
        res.render('home');
    });

    router.get("/about-me", function(req,res){
        res.render("about-me");
    });

    router.get("/about-me/1", function(req,res){
        res.render("about-me-sec1");
    });

    router.get("/about-me/2", function(req,res){
        res.render("about-me-sec2");
    });

    router.get("/blog/parts/blog", function(req,res){
        res.render("blog");
    });

    router.get("/blog/parts/list", function(req,res){
        res.render("bloglist");
    });

    router.get("/blog/parts/one", function(req,res){
        res.render("blogone");
    });

    router.get("/download/:name", function (req, res, next) {

        App.models.blog.Blog.findOneQ({_id: req.params.name}).then(function(data){
            if(!data._id) return next();
            res.setHeader("Content-Type", "text/x-markdown");
            res.end(data.body);
        }).fail(function(err){
            res.end(String(err));
        });

    });

}