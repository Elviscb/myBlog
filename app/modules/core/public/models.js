angular.module("Cb.models",[]).factory("Http", ["$http",function($http){
    var ret = {
        _successcb: function(){},
        _errorcb: function(){},
        actor: $http,
        handle: function(promise){
            var _this = ret;
            promise.success(function(data, status, headers, config) {
                //TODO

                _this._successcb.apply(this, arguments);
            }).error(function(data, status, headers, config) {
                //TODO alert something...

                _this._errorcb.apply(this, arguments);
            });

            return {
                success: function (successcb) {
                    if(angular.isFunction(successcb)) _this._successcb = successcb;
                },
                error: function(errorcb){
                    if(angular.isFunction(errorcb)) _this._errorcb = errorcb;
                }
            }
        }
    };

    return ret;
}]).factory("Blog", ["Http",function(http){

    var handler = http.handle
      , actor = http.actor
      , Blog = {
            all: function(page,count){
                if(!page) page = 1;
                if(!count) count = 10;
                return handler(actor.get('/m/blog/all?page='+page+'&count='+count));
            },
            one: function(id){
                id = encodeURIComponent(id);
                return handler(actor.get('/m/blog/show?id='+id));
            },
            del: function(id){
                id = encodeURIComponent(id);
                return handler(actor.get('/m/blog/destroy?id='+id));
            }
        };

    return Blog;

}]).factory("Logger", ["Http",function(http){
    var handler = http.handle
      , actor = http.actor
      , Logger = {
            err: function(){
                return handler(actor.get('/admin/errlog'));
            },
            visit: function(){
                return handler(actor.get('/admin/visitlog'));
            }
        };

    return Logger;
}]).filter("size", function(){
    return function(input){
        input = parseInt(input);
        if(isNaN(input)) return "";
        var exts = ["KB","MB","GB","TB"]
          , base = input
          , i = 0;

        while((base = Math.ceil(base*10/1024))>=1024*10){
            i++;
            if(i == exts.length-1) break;
        }

        return base/10 + exts[i];
    };
});
