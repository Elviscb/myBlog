/**
 * this file is for blogs based on fs
 */

var Q = require("q")

  , fs = require("fs")

  , _ = require("underscore")

  , formatCreator = require("./../formatCreator")

    //blogs location
  , blogsPath = __dirname + "../../../../blogs/"

    //find all blogs and cached (based on q)
  , _blogs = (function(){

        var d = Q.defer()
          , _callee = arguments.callee;

        //allow refresh
        d.promise.refresh = function(){
            _blogs = _callee();
        };

        fs.readdir(blogsPath, function(err, data){
            if(err) d.reject(err);
            else {
                var qs = [];
                for(i in data)
                    qs.push.apply(qs, (function(){
                        var t = i
                          , title = data[t]
                          , d = Q.defer()
                          , d1 =  Q.defer();
                        data[t] = {
                            _id: title.substring(0, title.lastIndexOf(".md")),
                            title: title
                        };
                        fs.stat(blogsPath + title, function(err, data1){
                            if(err) d.reject(err);
                            else {
                                data1.date = data1.mtime;
                                _.extend(data[t], data1);
                                d.resolve();
                            }
                        });
                        fs.readFile(blogsPath + title, function(err, data1){
                            if(err) d1.reject(err);
                            else {
                                data[t].body = data1.toString();
                                d1.resolve();
                            }
                        });
                        return [d.promise, d1.promise];
                    })())

                Q.all(qs).spread(function(){
                    d.resolve(data);
                }).fail(d.promise.fail);
            }
        });

        d.promise.fail(function(err){
            console.log(err);
        });

        return d.promise;
    })()

  , Blog = {

        save: function(o, call){
            fs.writeFile(blogsPath + o.title + ".md", o.body, call);
            _blogs.refresh();
        },

        findOneAndUpdateQ: function(con, o){
            var d = Q.defer();

            function c(err){
                if(err) d.reject(err);
                else d.resolve();
            }

            this.findOneQ(con).then(function(data){
                var _this = this;
                if(!data._id)
                    d.reject("not found");
                _.extend(data, o);
                fs.writeFile(blogsPath + data.title, o.body, c);
                fs.rename(blogsPath + data.title, blogsPath + o.title, c);
            });

            return d.promise;
        },

        findByIdAndRemoveQ: function(id){
            var d = Q.defer();
            this.findByIdQ(id).then(function(data){
                if(!data._id)
                    d.reject("not found");
                fs.unlink(blogsPath + data.title, function(err){
                    if(err) return d.reject(err);
                    d.resolve();
                    delete data;
                });
            });
            return d.promise;
        },

        findByIdQ: function(id){
            return this.findOneQ.call(this, {_id:id});
        },

        findOneQ: function(o){
            var deferred = Q.defer();

            _blogs.then(function(data){
                var r = _.find(data, function(d){
                    for(k in o){
                        if(o[k] !== d[k])
                            return false;
                    }
                    return true;
                }) || {};
                deferred.resolve(r);
            });

            return deferred.promise;
        },

        find:function(){

            var a = {
                "sort":function(d, data){

                },
                "skip":function(d, data){

                },
                "limit":function(d, data){

                }
            },

            o = {
                execQ:function(){
                    var deferred = Q.defer()
                      , _this = this;

                    _blogs.then(function(data){
                        for(k in a){
                            if(o[k][k])
                                a[k](o[k][k], data);
                        }
                        deferred.resolve(data);
                    });

                    return deferred.promise;
                },
                countQ:function(){
                    var deferred = Q.defer();

                    this.execQ().then(function(data){
                        deferred.resolve(data.length);
                    });

                    return deferred.promise;
                }
            }

            for(k in a){
                (function(){
                    var t = k;
                    o[t] = function(data){
                        arguments.callee[t] = data;
                        return o;
                    }
                })();
            }
            return o;
        }
    };

//refresh blogs every 5 minute
setInterval(_blogs.refresh, 1000 * 60 * 5);

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
    else Blog.save(req.body, call);

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