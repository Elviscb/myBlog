/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-9-2
 * Time: 下午2:39
 */

var mongoose = require('./../mongoose-connection')
  , Q = require("q")
  , _ = require("underscore")

  , blogSchema = mongoose.Schema({
        title:  String,
        author: String,
        body:   String,
        comments: [{ body: String, date: Date }],
        date: { type: Date, default: Date.now },
        hidden: { type: Boolean, default:false },
        meta: {
            votes: Number,
            favs:  Number
        }
    })

  , Blog = mongoose.model("blog", blogSchema);

exports.Blog = Blog;

exports.index = (function(req, res, next){
    function exec(req, res, next, callback){
        var pager = require("./../../pager.js")
            (req.params.page, req.params.count);

        var qu = Blog.find().sort("-date").skip(pager.count * (pager.page-1)).limit(pager.count);

        Q.all([
            qu.execQ(),
            qu.countQ()
        ]).spread(function(data, total){
            callback({
                blogs: data,
                pager: pager.setTotal(total)
            });
        }).fail(function(err){
            next(err);
        });
    };

    return {
        json: function(req, res, next){
            exec(req, res, next, function(data){
                res.json(data);
            });
        },
        html: function(req, res, next){
            exec(req, res, next, function(data){
                res.render("list", data);
            });
        },
        default: function(req, res, next){
            this.html(req, res, next);
        }
    }
}).call(this);

exports.new = function(req, res){
    res.send('new blog');
};

exports.create = function(req, res, next){

    if(!req.body.title)
        res.end("title can't be empty");
    else new Blog(_.extend(req.body,{
        author:"elvis"
    })).save(function(err, data){
        err ? next(err) : res.end('create blog!id:' + data._id.toString());
    });

};

exports.show = function(req, res, next){
    var highlighter = require('highlight.js')
        , marked = require('marked')
        , tempReg = "G4q9QxkP4Lfe3S";

    marked.setOptions({
        gfm:true,
        anchors: true,
        pedantic:false,
        smartypants:true,
        // callback for code highlighter
        highlight:function (code, lang) {
            var langs = {
                js: "javascript"
            };
            try{
                return highlighter.highlight(langs[lang]?langs[lang]:lang, code).value;
            }catch(e){
                return highlighter.highlightAuto(code).value;
            }
        }
    });

    //find blog & 10 latest blog
    Q.all([
            Blog.findByIdQ(req.params.blog),
            Blog.find().sort("-date").limit(10).execQ()
        ]).spread(function (blog, blogs) {

            !blog._id ? next() :
                res.render("blog", {
                    menus: blogs,
                    locsAll: ["", blog.title, "/blog", "blog"],
                    blog: {
                        _id: blog._id,
                        name: blog.title,
                        text: marked(blog.body.toString()),
                        code: marked("```markdown\n" + blog.body.toString().replace(/\n```/g, tempReg) + "\n```")
                            .replace(new RegExp(tempReg, "g"), "```")
                    },
                    title: blog.title
                });

        }).fail(function (err) {
            console.log(err);
            next(err);
        });
};

exports.edit = function(req, res){
    res.send('edit blog ' + req.params.blog);
};

exports.update = function(req, res, next){

    Blog.findOneAndUpdateQ({_id:req.body._id},{
        title: req.body.title,
        body: req.body.body
    }).then(function(data){
        res.end('update blog ' + data._id.toString());
    },function(err){
        next(err);
    });

};

exports.destroy = function(req, res){
    res.send('destroy blog ' + req.params.blog);
};