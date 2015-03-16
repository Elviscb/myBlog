Cb(function(){
    var app = Cb.app;

    app.config(['$urlRouterProvider','$stateProvider', function($urlRouterProvider,$stateProvider) {

        $stateProvider.state("blog",{
            abstract: true,
            url: "/blog",
            templateUrl: "/blog/parts/blog"
        }).state("blog.list",{
            url: "",
            templateUrl: "/blog/parts/list",
            controller: "listController"
        }).state("blog.one",{
            url: "/{id:.*}",
            templateUrl: "/blog/parts/one",
            controller: "blogoneController"
        });

    }]);

    app.controller("listController", ["$scope", "$rootScope", "$stateParams", "Blog", function($scope,$rootScope,$stateParams,Blog){

        Blog.all(1, 1000).success(function(data){
            $scope.blogs = data.result.blogs;
            $scope.pager = data.result.pager;

        });

    }]);

    app.controller("blogoneController", ["$scope", "$rootScope", "$stateParams", "Blog", function($scope,$rootScope,$stateParams,Blog){

        var id = $stateParams.id;

        $scope.id = id;
        Blog.one(id).success(function(data){
            $scope.blog = data.result.blog;
            $scope.locsAll = data.result.locsAll;
        });
        $scope.loading = "loading...";

    }]);

});
