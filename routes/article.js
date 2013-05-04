var markdown = require("markdown").markdown;
var fs = require("fs");

module.exports = function (app) {
    app.get("/:article", function (req, res) {
        var text, s, t, menus = [];
        fs.readFile("articles/mds/"+req.params.article+".md",function(err,data){
            if(err){
                console.log(err);
                text = "not found";
            }else{
                s = markdown.parse(data.toString());
                for(i in s){
                    t = s[i];
                    if( t instanceof Array && t[0]=="header"){
                        if( t[1]["level"] < 3 )
                            menus.push( [ t[1]["id"], t[2] ] );
                    }
                }
                text = markdown.toHTML(s);
            }
            res.render("article/article", {
                url:"/articles",
                menus: menus,
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