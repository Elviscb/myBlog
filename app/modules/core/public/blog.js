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

    app.controller("listController", ["$scope", "$rootScope", "$stateParams", "Restangular", "RestFulResponse", "Pager",
        function($scope,$rootScope,$stateParams,Restangular,RestFulResponse,Pager){
        $scope.limit=1000;
        $scope.loading = "loading...";
        $scope.pager = {};
        $scope.go = function(page){
            if(!page) page = $scope.page;
            if(page < 1 || ($scope.pager.totalpage && page > $scope.pager.totalpage)) return;
            $scope.page = page;
            $scope.isloading = true;
            RestFulResponse.all('blog').getList({
                _start: $scope.limit*(page-1),
                _limit: $scope.limit
            }).then(function(res) {
                var blogs = res.data;
                var total = res.headers("x-Total-Count");
                $scope.pager = Pager.new(page,$scope.limit,10,total).format();
                $scope.isloading = false;
                $scope.blogs = blogs;
            }).catch(function(){
                $scope.isloading = false;
            });
        };
        $scope.go(1);
    }]);

    app.controller("blogoneController", ["$scope", "$rootScope", "$stateParams", "Restangular", function($scope,$rootScope,$stateParams,Restangular){

        var id = $stateParams.id;

        $scope.id = id;
        Restangular.one('blog', id).get({
            marked: 1
        }).then(function(data){
            $scope.blog = data;
        });
        $scope.loading = "loading...";

    }]);

});
