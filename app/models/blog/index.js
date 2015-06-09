/**
 * this file is for blogs based on fs
 */

var Q = require("q")

  , fs = require("fs")

  , _ = require("underscore")

  , path = require("path")

    //blogs location
  , blogsPath = path.join(__dirname,"doc")

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
                    qs.push((function(){
                        var t = i
                          , title = data[t]
                          , d = Q.defer();
                        data[t] = {
                            _id: title,
                            title: title
                        };
                        fs.stat(path.join(blogsPath, title), function(err, data1){
                            if(err) d.reject(err);
                            else {
                                data1.date = data1.mtime;
                                _.extend(data[t], data1);
                                d.resolve();
                            }
                        });
                        /*
                        fs.readFile(blogsPath + title, function(err, data1){
                            if(err) d1.reject(err);
                            else {
                                data[t].body = data1.toString();
                                d1.resolve();
                            }
                        });
                        */
                        return d.promise;
                    })());

                Q.all(qs).spread(function(){
                    d.resolve(data);
                }).fail(d.reject);
            }
        });

        return d.promise;
    })()

  , Blog = {

        save: function(o, call){
            var d = Q.defer();
            var filename = path.join(blogsPath, o.title);
            fs.writeFile(filename, o.body, function(err){
                if(err) return d.reject(err);
                fs.stat(filename, function(err, stat){
                    if(err) d.reject(err);
                    d.resolve(_.extend(stat,{
                        _id: o.title,
                        title: o.title
                    }));
                });
                _blogs.refresh();
            });
            return d.promise;
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
                    _blogs.refresh();
                });
            });
            return d.promise;
        },

        findByIdQ: function(id){
            return this.findOneQ.call(this, {_id:id});
        },

        findOneQ: function(o){
            return _blogs.then(function(data){
                var r = _.find(data, function(d){
                    for(k in o){
                        if(o[k] !== d[k])
                            return false;
                    }
                    return true;
                });
                return r;
            }).then(function(r){
                if(!r){
                    throw new Error("not found");
                }
                r = _.clone(r);
                return App.tools.read_file(path.join(blogsPath, r.title)).then(function(data){
                    return _.extend(r,{
                        body: data
                    });
                });
            });
        },

        find:function(){

            var a = {
                "sort":function(d, data){
                    var reverse = d[0] == "-";
                    if(reverse) d = d.substring(1);
                    data.sort(function(field1,field2){
                        if(!(d in field1)) return true;
                        return reverse?field1[d] < field2[d]:field1[d] > field2[d];
                    });
                    return data;
                },
                "skip":function(d, data){
                    var r = [];
                    d = parseInt(d);
                    for(i=d;i<data.length;i++){
                        r.push(data[i]);
                    }
                    return r;
                },
                "limit":function(d, data){
                    var r = [];
                    d = parseInt(d);
                    for(i=0;i<Math.min(d,data.length);i++){
                        r.push(data[i]);
                    }
                    return r;
                }
            },

            o = {
                execQ:function(){
                    var defer = Q.defer()
                      , _this = this;

                    _blogs.then(function(data){
                        var data0 = _.clone(data);
                        for(k in a){
                            if(o[k][k])
                                data0 = a[k](o[k][k], data0);
                        }
                        defer.resolve(data0);
                    });

                    return defer.promise;
                },
                countQ:function(){
                    var defer = Q.defer();

                    _blogs.then(function(data){
                        defer.resolve(data.length);
                    }).fail(defer.reject);

                    return defer.promise;
                }
            };

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

_blogs.fail(function(e){
    console.log(e.stack);
    process.exit(0);
});

//refresh blogs every 5 minute
setInterval(_blogs.refresh, 1000 * 60 * 5);

console.log(blogsPath);

exports.Blog = Blog;

exports.create = function(title, body){

    if(!title) {
        var defer = Q.defer();
        defer.reject("title can't be empty");
        return defer.promise;
    }
    else return Blog.save({
        title: title,
        body: body
    });
};

exports.all = function(page, count){

    var defer = Q.defer();

    var qu;

    if(page == -1){
        qu = Blog.find().sort("-mtime");
    }else{
        var pager = App.tools.pager(page, count);
        qu = Blog.find().sort("-mtime").skip(pager.count * (pager.page-1)).limit(pager.count);
    }

    Q.spread([
        qu.execQ(),
        qu.countQ()
    ],function(data, total){
        if(page == -1) defer.resolve({
            blogs: data,
            total: total
        });
        else defer.resolve({
            blogs: data,
            pager: pager.setTotal(total).format()
        });
    }).fail(defer.reject);

    return defer.promise;
};

exports.show = function(id){
    var highlighter = require('highlight.js')
      , marked = require('marked');

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
    return Q.spread([
        Blog.findByIdQ(id),
        Blog.find().sort("-date").limit(10).execQ()
    ], function (blog, blogs) {

        return !blog._id ? {
            menus: blogs,
            blog: {},
            title:""
        }:{
            menus: blogs,
            blog: {
                _id: blog._id,
                mtime: blog.mtime.getTime(),
                size: blog.size,
                name: blog.title,
                text: marked(blog.body.toString())
            },
            title: blog.title
        };

    });
};

exports.update = function(id,title,body){

    return Blog.findOneAndUpdateQ({_id:id},{
        title: title,
        body: body
    });

};

exports.destroy = function(id){
    return Blog.findByIdAndRemoveQ(id);
};