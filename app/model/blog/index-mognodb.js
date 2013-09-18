/**
 * Created with Elviscb.
 * User: Administrator
 * Date: 13-9-2
 * Time: 下午2:39
 *
 * this file is for blogs based on mongodb
 */

var mongoose = require('./../mongoose-connection')
  , Q = require("q")
  , _ = require("underscore")
  , formatCreator = require("./../formatCreator")

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

exports.index = formatCreator.Q(function(req, res, next, callback){

    var pager = require("./../../pager.js")
        (req.params.page, req.params.count);

    var qu = Blog.find().sort("-date").skip(pager.count * (pager.page-1)).limit(pager.count);

    return Q.all([
        qu.execQ(),
        qu.countQ()
    ]).spread(function(data, total){
        callback({
            blogs: data,
            pager: pager.setTotal(total)
        });
    });

}, "list");

exports.new = function(req, res){
    res.send('new blog');
};

exports.create = formatCreator(function(req, res, next, call){

    if(!req.body.title)
        call(400, "title can't be empty");
    else new Blog(_.extend(req.body,{
        author:"elvis"
    })).save(call);

});

exports.show = formatCreator.Q(function(req, res, next, call){
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
    return Q.all([
            Blog.findByIdQ(req.params.blog),
            Blog.find().sort("-date").limit(10).execQ()
        ]).spread(function (blog, blogs) {

            !blog._id ? next() :
                call({
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

        });
}, "blog");

exports.edit = function(req, res){
    res.send('edit blog ' + req.params.blog);
};

exports.update = formatCreator.Q(function(req, res, next, call){

    return Blog.findOneAndUpdateQ({_id:req.body._id},{
        title: req.body.title,
        body: req.body.body
    }).then(call);

});

exports.destroy = formatCreator.Q(function(req, res, next, call){
    return Blog.findByIdAndRemoveQ(req.params.blog).then(call);
});