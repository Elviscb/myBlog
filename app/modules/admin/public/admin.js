Cb(function(){
    var app = angular.module("Cb.admin",[
        "Cb.service",
        'ui.router',
        "restangular"
    ]).run(
        ['$rootScope', '$state', '$stateParams', "Restangular",
            function ($rootScope, $state, $stateParams, Restangular) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                Restangular.setBaseUrl(Cb.restful_prefix);
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
            }).state("blog-edit",{
                url: "/blog-edit/:id",
                templateUrl: "/admin/blog-create",
                controller: "blogEditController"
            }).state("blog-create",{
                url: "/blog-create",
                templateUrl: "/admin/blog-create",
                controller: "blogCreateController"
            }).state("logger",{
                url: "/logger",
                templateUrl: "/admin/logger",
                controller: "loggerController"
            });
            $urlRouterProvider.otherwise("/");

    }]);

    app.controller("navController", ["$scope", "$rootScope", function($scope,$rootScope){
        var nav = angular.element("#nav");
        $scope.toggle = function(){
            nav.toggleClass('active');
        }
    }]);

    app.controller("blogController", ["$scope", "$rootScope", "Restangular", "RestFulResponse", "Pager", "$http",
    function($scope,$rootScope,Restangular,RestFulResponse,Pager,$http){
        $scope.limit=10;
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
        //查看
        var template1 = angular.element("#template1");
        $scope.view = function(id){
            Restangular.one('blog', id).get().then(function(data){
                template1
                    .find(".modal-body > p")
                    .html(data.body)
                    .end()
                    .find(".modal-header #myModalLabel")
                    .html(data.title)
                    .end()
                    .modal({});
            });
        };
        //删除
        $scope.del = function(id){
            if(!confirm("删除?")) return;
            Restangular.one('blog', id).remove().then(function(data){
                $scope.go();
            });
        };
        //init
        $scope.go(1);
    }]);

    app.controller("blogCreateController", ["$scope", "$rootScope", "Restangular","$http", function($scope,$rootScope,Restangular,$http){
        var editor = new SimpleMDE({
            element: $('#mdeditor')[0]
        });
        editor.render();
        $scope.titletop = "新建";
        $scope.post = function(){
            if(!$scope.title){
                $scope.put_success = false;
                $scope.put_false = true;
                $scope.put_false_text = "文章名为空.";
                return;
            }
            Restangular.all('blog').post({
                title: $scope.title,
                body: editor.value(),
                created_at: new Date()
            }).then(function(){
                $scope.put_success = true;
                $scope.put_false = false;
                $scope.put_success_text = "已保存";
            });
        };
    }]);

    app.controller("blogEditController", ["$scope", "$rootScope", "Restangular","$http", function($scope,$rootScope,Restangular,$http){
        var editor;
        $scope.blogid = $rootScope.$stateParams.id;
        Restangular.one('blog', $scope.blogid).get().then(function(data){
            $scope.titletop = "编辑";
            $scope.title = data.title;
            $scope.body = data.body;
            $scope.post = function(){
                if(!$scope.title){
                    $scope.put_success = false;
                    $scope.put_false = true;
                    $scope.put_false_text = "文章名为空.";
                    return;
                }
                data.title = $scope.title;
                data.body = editor.value();
                data.put().then(function(data){
                    $scope.put_success = true;
                    $scope.put_false = false;
                    $scope.put_success_text = "已保存";
                });
            };
            setTimeout(function(){
                editor = new SimpleMDE({
                    element: $('#mdeditor')[0]
                });
                editor.render();
            });
        });
    }]);

    app.controller("loggerController", ["$scope", "$rootScope", "Logger", "$http", function($scope,$rootScope,Logger,$http){
        Logger.visit().success(function(data){
            $scope.data = data.result;
        });
    }]);
});
