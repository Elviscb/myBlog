(function(){

    "use strict";

    console.log("sup");

    setInterval(function(){
        $("#wrapper").nanoScroller();
    },2000);

    marked.setOptions({
        gfm:true,
        anchors: true,
        pedantic:false,
        smartypants:true
    });

    var app = angular.module("admin", ['ngResource']);

    $("#viewer").nanoScroller();

    app.factory("Blog", ["$resource", function($resource){

        var Blog = $resource('/blog/:id.json',{id:""},{
            query: {method: "GET", isArray:false}
        });

        return Blog;

    }]);

    app.directive('codeMirror', function() {
        return function(scope, element, attrs) {
            console.log(element[0]);
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

        $scope.query = function(){
            Blog.query().$then(function(data){
                $rootScope.blogs = data.data.blogs;
                $("#wrapper").nanoScroller();
            });
        }

        $scope.format = function(date){
            date = new Date(date);
            return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.toTimeString().substring(0,8);
        }

        $scope.query();

    }]);

    app.controller("blogController", ["$scope", "$rootScope", "$routeParams", function($scope,$rootScope,$routeParams){

        $scope.marked = marked;
        $scope.save = function(){
            if(!$rootScope.cBlog.title)
                return alert("没有标题");
            if(!$rootScope.cBlog.body)
                return alert("没有内容");
            $.ajax({
                type : $rootScope.cBlog ? "POST" : "PUT",
                url: $rootScope.cBlog ? "/blog/" + $rootScope.cBlog._id : "/blog",
                data: $rootScope.cBlog
            }).complete(function(data){
                alert(data.responseText);
            });
        };

        $scope.callback = function(editor){

            $scope.editor = editor;

            $scope.new_ = function(){
                $rootScope.cBlog = {
                    title: "",
                    body: ""
                };
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
            })) || $scope.new_();

            editor.setValue($rootScope.cBlog.body);
        };

    }]);

})();