Cb(function(){
    var app = angular.module("Cb.admin");

    app.directive('topDropDown', function() {
        return {
            restrict: 'E',
            scope: {
              title: "@",
              href: "@"
            },
            transclude: true,
            templateUrl: 'top-drop-down.html',
            controller: function($scope) {

            },
            link: function(scope, element, attrs, tabsCtrl){
                var down = element.find(".ddown");
                var ul = down.children("ul").hide();
                down.children("p").mouseenter(function(){
                    ul.animate({
                        opacity: 1
                    },400,function(){
                        ul.show();
                    });
                })
                down.mouseleave(function(){
                    ul.stop().hide();
                });
            }
        };
    }).directive('topDropDownOption', function() {
        return {
            restrict: 'E',
            scope: {
                title: "@",
                href: "@"
            },
            transclude: true,
            require: "^topDropDown",
            templateUrl: 'top-drop-down-option.html',
            link: function(scope, element, attrs, tabsCtrl) {

            }
        };
    });
});
