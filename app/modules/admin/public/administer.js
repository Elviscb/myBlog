(function(){

    "use strict";

    console.log("sup");

    //每两秒刷新滚动条
    setInterval(function(){
        $("#wrapper, #viewer").nanoScroller();
    },2000);

    marked.setOptions({
        gfm:true,
        anchors: true,
        pedantic:false,
        smartypants:true
    });

    var app = angular.module("admin", ['ngResource']);

    app.factory("Blog", ["$resource", function($resource){

        var Blog = $resource('/blog/:id.json',{id:"@_id"},{
            query: {method: "GET", isArray:false},
            update: {method: "PUT"}
        });

        return Blog;

    }]);

    app.directive('codeMirror', function() {
        return function(scope, element, attrs) {
            scope.callback(CodeMirror.fromTextArea(element[0],{
                lineWrapping: false,
                theme: "default",
                lineNumbers: true,
                mode: "markdown"
            }));
        }
    });

    app.config(['$routeProvider','$locationProvider','$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {

        $routeProvider.when("/:id",{
            templateUrl: "/administer/one",
            controller: "blogController"
        });

    }]);

    app.controller("blogsController", ["$scope", "$rootScope", "Blog", function($scope, $rootScope, Blog){

        $rootScope.query = function(){
            Blog.query().$then(function(data){
                $rootScope.blogs = data.data.blogs;
                $("#wrapper").nanoScroller();
            });
        }

        $scope.del = function(id){
            confirm("删除?") ? new Blog({_id:id}).$delete(function(q, resh){
                q.$then(function(r){
                    $rootScope.query();
                    $rootScope.new_();
                    alert("已删除");
                },function(err){
                    alert(err);
                })
            }) : null;
        }

        $scope.format = function(date){
            date = new Date(date);
            return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.toTimeString().substring(0,8);
        }

        $rootScope.query();

    }]);

    app.controller("blogController", ["$scope", "$rootScope", "$routeParams", "Blog", function($scope,$rootScope,$routeParams,Blog){

        $scope.marked = marked;
        $scope.save = function(){
            if(!$rootScope.cBlog.title)
                return alert("没有标题");
            if(!$rootScope.cBlog.body)
                return alert("没有内容");

            new Blog($rootScope.cBlog)[$rootScope.cBlog._id?"$update":"$save"](function(p, res){
                p.$then(function(r){
                    $rootScope.query();
                    alert("已保存");
                },function(err){
                    alert(err);
                });
            });

//            $.ajax({
//                type : $rootScope.cBlog ? "POST" : "PUT",
//                url: $rootScope.cBlog._id ? "/blog/" + $rootScope.cBlog._id : "/blog",
//                data: $rootScope.cBlog
//            }).complete(function(data){
//                alert(data.responseText);
//            });
        };

        $scope.callback = function(editor){

            $scope.editor = editor;

            $rootScope.new_ = function(){
                $rootScope.cBlog = ({
                    title: "",
                    body: ""
                });
                editor.setValue("");
            };

            editor.on("change",function(ins, changeObj){
                if($rootScope.cBlog.body == editor.getValue())
                    return;
                $rootScope.cBlog.body = editor.getValue();
                $rootScope.$apply();
                $("#viewer").nanoScroller();
            });
            editor.focus();

            ($rootScope.cBlog = _.find($rootScope.blogs, function(v){
                return v._id == $routeParams.id;
            })) || $rootScope.new_();

            editor.setValue($rootScope.cBlog.body);
        };

    }]);

})();