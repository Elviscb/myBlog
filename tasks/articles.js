
module.exports = function (grunt) {

    'use strict';

    var highlighter = require('highlight.js')
        , marked = require('marked')
        , jade = require("jade")
        , read_file = require("./read_file")();

    grunt.registerTask('article', 'compile articles', function () {
        grunt.log.ok('Generating articles...');

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

        var realPath = "articles/mds/"
            , tmpl = "src/tmpl/article/article.jade"
            , locs
            , locsAll = []
            , tempReg = "G4q9QxkP4Lfe3S";

        locs = realPath.split("/");
        while (locs.length) {
            locsAll.push("/" + locs.join("/"), locs.pop());
        }

        read_file(realPath).then(function(files){

            files.forEach(function(f){
                read_file(realPath + f).then(function(data){
                    locsAll[1] = f;
                    try{

                    data = jade.compile(grunt.file.read(tmpl),{filename:tmpl})
                    ({
                        url: "/articles",
                        menus: files,
                        locsAll: locsAll,
                        article: {
                            name: locsAll[1].replace(/\.[^.]*$/g,""),
                            text: marked(data.toString()),
                            code: marked("```markdown\n" + data.toString().replace(/\n```/g,tempReg) + "\n```")
                                .replace(new RegExp(tempReg,"g"),"```")
                        },
                        title: f
                    });

                    }catch(e){
                        grunt.log.error(e);
                    }
                    grunt.log.ok(realPath+f);
                    grunt.log.ok(data.substring(0,10));
                    grunt.file.write("build/"+realPath+ f.replace(".md",".html"),data);
                })
            });

        });


    });

}