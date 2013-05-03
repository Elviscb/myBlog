var md = require("node-markdown").Markdown;
var fs = require("fs");

module.exports = function (app) {
    app.get("/:article", function (req, res) {
        var text,menus;
        fs.readFile("articles/mds/"+req.params.article+".md",function(err,data){
            if(err){
                console.log(err);
                text = "not found";
            }else{
                text = md(data.toString(),true);
//              menus = md(data.toString(),true,"h1");
            }
            res.render("article/article", {
                url:"/articles",
                article: {
                    name: req.params.article,
                    text: text,
                    code: "<a>呵呵</a>"
                },
                title: req.params.article
            });
        });
    });
}