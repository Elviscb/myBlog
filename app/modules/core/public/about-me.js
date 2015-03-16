Cb(function(){
    var app = Cb.app;

    app.config(['$urlRouterProvider','$stateProvider', function($urlRouterProvider,$stateProvider) {

        $stateProvider.state("about-me",{
            abstract: true,
            url: "/about-me",
            templateUrl: "/about-me"
        }).state("about-me.tab1",{
            url: "/1",
            templateUrl: "/about-me/1",
            controller: "about-me1Controller"
        }).state("about-me.tab2",{
            url: "/2",
            templateUrl: "/about-me/2",
            controller: "about-me2Controller"
        });

    }]);

    app.controller("about-me1Controller", ["$scope", "$rootScope", "$stateParams", "Blog", function($scope,$rootScope,$stateParams,Blog){


    }]);

    app.controller("about-me2Controller", ["$scope", "$rootScope", "$stateParams", "Blog", function($scope,$rootScope,$stateParams,Blog){

        Blog.one("about-me").success(function(data){
            $scope.blog = data.result.blog;
        });
        $scope.loading = "loading...";

    }]);

});
