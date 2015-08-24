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
                abstract: true,
                url: "/blog",
                templateUrl: "/admin/blog"
            }).state("blog.list",{
                url: "",
                templateUrl: "/admin/blog-list",
                controller: "blogController"
            }).state("blog.create",{
                url: "/create",
                templateUrl: "/admin/blog-create",
                controller: "blogOneController"
            }).state("blog.edit",{
                url: "/:id",
                templateUrl: "/admin/blog-create",
                controller: "blogOneController"
            })
            //user
            .state("user",{
                abstract: true,
                url: "/user",
                templateUrl: "/admin/user"
            }).state("user.list",{
                url: "",
                templateUrl: "/admin/user-list",
                controller: "userController"
            }).state("user.create",{
                url: "/create",
                templateUrl: "/admin/user-create",
                controller: "userOneController"
            }).state("user.edit",{
                url: "/:id",
                templateUrl: "/admin/user-create",
                controller: "userOneController"
            })
            .state("logger",{
                url: "/logger",
                templateUrl: "/admin/logger",
                controller: "loggerController"
            });
            $urlRouterProvider.otherwise("/blog");

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
            Restangular.one('blog', id).get({
                marked: 1
            }).then(function(data){
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

    app.controller("blogOneController", ["$scope", "$rootScope", "Restangular","$http", function($scope,$rootScope,Restangular,$http){
        var editor;
        $scope.titletop = "新增";
        $scope.blogid = $rootScope.$stateParams.id;
        $scope.blogid?
            Restangular.one('blog', $scope.blogid).get().then(function(data){
                $scope.titletop = "编辑";
                $scope.data = data;
                init();
            }):init();
        function init(){
            Restangular.all('user').getList().then(function(data){
                $scope.users = data;
                if(!$scope.data) $scope.data = {};
                if(!$scope.data.userId){
                    $scope.data.userId = Cb.user.id;
                }
            });
            $scope.post = function(){
                if(!$scope.data.title){
                    $scope.put_success = false;
                    $scope.put_false = true;
                    $scope.put_false_text = "文章名为空.";
                    return;
                }
                $scope.data.body = editor.value();
                ($scope.data.put?$scope.data.put():Restangular.all('blog').post($scope.data)).then(function(data){
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
        }
    }]);

    app.controller("loggerController", ["$scope", "$rootScope", "$http", function($scope,$rootScope,$http){
        $http.get("/admin/visitlog").success(function(data){
            $scope.data = data.result;
        });
    }]);

    app.controller("userController", ["$scope", "$rootScope", "Restangular", "RestFulResponse", "Pager", "$http",
        function($scope,$rootScope,Restangular,RestFulResponse,Pager,$http){

        $scope.limit=10;
        $scope.loading = "loading...";
        $scope.pager = {};
        $scope.go = function(page){
            if(!page) page = $scope.page;
            if(page < 1 || ($scope.pager.totalpage && page > $scope.pager.totalpage)) return;
            $scope.page = page;
            $scope.isloading = true;
            RestFulResponse.all('user').getList({
                _start: $scope.limit*(page-1),
                _limit: $scope.limit
            }).then(function(res) {
                var users = res.data;
                var total = res.headers("x-Total-Count");
                $scope.pager = Pager.new(page,$scope.limit,10,total).format();
                $scope.isloading = false;
                $scope.users = users;
            }).catch(function(){
                $scope.isloading = false;
            });
        };
        //init
        $scope.go(1);

    }]);

    app.controller("userOneController", ["$scope", "$rootScope", "Restangular", "RestFulResponse", "Pager", "$http",
        function($scope,$rootScope,Restangular,RestFulResponse,Pager,$http){

            $scope.titletop = "新增";
            $scope.userid = $rootScope.$stateParams.id;
            $scope.userid?
                Restangular.one('user', $scope.userid).get().then(function(data){
                    $scope.titletop = "编辑";
                    $scope.data = data;
                    init();
                }):init();
            function init(){
                $scope.post = function(){
                    if(!$scope.data.nick){
                        $scope.put_success = false;
                        $scope.put_false = true;
                        $scope.put_false_text = "用户名为空.";
                        return;
                    }
                    ($scope.data.put?$scope.data.put():Restangular.all('user').post($scope.data)).then(function(){
                        $scope.put_success = true;
                        $scope.put_false = false;
                        $scope.put_success_text = "已保存";
                    });
                };
            }
        }]);
});
