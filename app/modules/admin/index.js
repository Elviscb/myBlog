var BlogResource = require("./../../model/blog")
    , Blog = BlogResource.Blog;

module.exports = function(app){

    //back
    app.get("/administer", function (req, res, next) {

        Blog.find().sort("-date").execQ().then(function(blogs){
            res.render("administer", {
                blogs: blogs
            });
        }).fail(function(err){
                next(err);
            });

    });

    app.get("/administer/one", function(req, res, next){
        res.render("adminOne");
    });

}