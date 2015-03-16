Cb(function(){

    console.log("sup");

    var app = Cb.app = angular.module(Cb.angular_module_name,[
        'Cb.models',
        'ui.router',
        'ngSanitize'
    ]).run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams) {

                // It's very handy to add references to $state and $stateParams to the $rootScope
                // so that you can access them from any scope within your applications.For example,
                // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
                // to active whenever 'contacts.list' or one of its decendents is active.
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

            $stateProvider.state("index",{
                url: "/",
                templateUrl: "/home",
                controller: "indexController"
            });
            $urlRouterProvider.otherwise("/");
        }]);

    app.controller("indexController", ["$scope",'Blog', function($scope,Blog){

    }]);

});