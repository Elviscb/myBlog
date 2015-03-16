Cb(function(){
    var app = angular.module("Cb.admin",[
        'Cb.models',
        'ui.router'
    ]).run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    );

    app.config([
        '$urlRouterProvider',
        '$stateProvider',
        '$locationProvider',
        function($urlRouterProvider,$stateProvider,$locationProvider) {

            $locationProvider.html5Mode(false);

            $stateProvider.state("blog",{
                url: "/",
                templateUrl: "/admin/blog",
                controller: "blogController"
            });
            $urlRouterProvider.otherwise("/");

    }]);

    app.controller("navController", ["$scope", "$rootScope", function($scope,$rootScope){
        var nav = angular.element("#nav");
        $scope.toggle = function(){
            nav.toggleClass('active');
        }
    }]);

    app.controller("blogController", ["$scope", "$rootScope", "Blog", "$http", function($scope,$rootScope,Blog,$http){
        $scope.count=10;
        $scope.loading = "loading...";
        $scope.pager = {};
        $scope.go = function(page){
            if(!page) page = $scope.page;
            if(page < 1 || ($scope.pager.totalpage && page > $scope.pager.totalpage)) return;
            $scope.isloading = true;
            Blog.all($scope.page = page,$scope.count).success(function(data){
                $scope.isloading = false;
                $scope.blogs = data.result.blogs;
                $scope.pager = data.result.pager;
            });
        };
        //新添
        var form = angular.element("#bform"),
            file = form.find("#bfile");
        $scope.file = file.get(0);
        $scope.file.onchange = function(){
            $scope.$apply();
        };
        $scope.selectfile = function(){
            file.click();
        };
        form.submit(function(e){
            e.preventDefault();
            form.ajaxSubmit({
                type: "post",
                success: function(){
                    $scope.go(1);
                }
            });
        });
        //查看
        var template1 = angular.element("#template1");
        $scope.view = function(id){
            Blog.one(id).success(function(data){
                template1
                    .find(".modal-body > p")
                    .html(data.result.blog.text)
                    .end()
                    .find(".modal-header #myModalLabel")
                    .html(data.result.title)
                    .end()
                    .modal({});
            });
        }
        //删除
        $scope.del = function(id){
            if(!confirm("删除?")) return;
            Blog.del(id).success(function(data){
                $scope.go();
            });
        }
        //init
        $scope.go(1);
    }]);

});
