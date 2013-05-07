var markdown = require("markdown").markdown;
var fs = require("fs"),
    url = require('url'),
    path = require("path");

module.exports = function (app) {
    app.get("/articles*",function(req,res){
        var pathname = decodeURI(url.parse(req.url).pathname),menu_loc="/articles";

        var realPath = pathname.substring(1);

        fs.exists(realPath, function (exists) {

            if (!exists) {

                //console.log("Can't find file:"+realPath);

                res.writeHead(404, {

                    'Content-Type': 'text/plain'

                });

                res.write("This request URL " + pathname + " was not found on this server.");

                res.end();

            } else {

                var ext = path.extname(realPath);

                if (!ext) {

                    if (!(pathname[pathname.length - 1] === "/")) {
                        res.redirect(pathname + "/");
                        return;
                    }

                    fs.readdir(realPath, function (err, files) {

                        if (err) {
                            res.writeHead(500, {

                                'Content-Type': 'text/plain'

                            });

                            res.end(err + "");
                        }

                        //输出
                        res.render("article/list",{
                            title: pathname,
                            url: menu_loc,
                            files: files
                        });

                    })
                    return console.log("Find dir:" + realPath);

                } else console.log("Find file:" + realPath);

                //res.redirect(pathname.substring( "/articles".length ));
                fs.readFile(realPath,function(err,data){

                    var text, s, t, menus = [], name, locs, locsAll = [];
                    s = markdown.parse(data.toString());
                    for (i in s) {
                        t = s[i];
                        if (t instanceof Array && t[0] == "header") {
                            if (t[1]["level"] < 3)
                                menus.push([ t[1]["id"], t[2] ]);
                        }
                    }

                    text = markdown.toHTML(s);

                    locs = realPath.split("/");

                    while(locs.length){
                        locsAll.push("/"+locs.join("/"),locs.pop());
                    }

                    res.render("article/article", {
                        url: menu_loc,
                        menus: menus,
                        locsAll: locsAll,
                        article: {
                            name: locsAll[1],
                            text: text,
                            code: "<a>呵呵</a>"
                        },
                        title: req.params.article
                    });
                });
            };
        });
    });
//    app.get("/:article", function (req, res) {
//        var text, s, t, menus = [];
//        fs.readFile("articles/"+req.params.article+".md",function(err,data){
//            if(err){
//                console.log(err);
//                text = "not found";
//            }else{
//                s = markdown.parse(data.toString());
//                for(i in s){
//                    t = s[i];
//                    if( t instanceof Array && t[0]=="header"){
//                        if( t[1]["level"] < 3 )
//                            menus.push( [ t[1]["id"], t[2] ] );
//                    }
//                }
//                text = markdown.toHTML(s);
//            }
//            res.render("article/article", {
//                url:"/articles",
//                menus: menus,
//                article: {
//                    name: req.params.article,
//                    text: text,
//                    code: "<a>呵呵</a>"
//                },
//                title: req.params.article
//            });
//        });
//    });
}