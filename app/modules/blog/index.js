var BlogResource = require("./../../model/blog")
    , Blog = BlogResource.Blog;

module.exports = function(app){

    app.get("/download/:name.md", function (req, res, next) {

        Blog.findOne({title:req.params.name},function(err, data){

            err ? next(err) : !data._id ? next() :

                res.set({
                    "Content-Type": "text/x-markdown",
                    "Content-length": data.body.length
                }).end(data.body);

        });

    });

}