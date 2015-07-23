angular.module("Cb.service",["restangular"]).factory('RestFulResponse', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setFullResponse(true);
    });
}).factory("Pager", function() {

    function Pager(page, count, pagecount, total){
        this.page = parseInt(page || 1);
        this.count = parseInt(count || 20);
        this.pagecount = parseInt(pagecount || 10);
        this.total = parseInt(total) || 0;
    };

    Pager.prototype.setTotal = function(data){
        this.total = data;
        return this;
    }

    Pager.prototype.__defineGetter__("totalpage",function(){
        return this.total%this.count==0?this.total/this.count:
        this.total/this.count-this.total%this.count/this.count+1;
    });

    Pager.prototype.__defineGetter__("pages",function(){
        var pn = this.page,
            pagecount = this.pagecount,
            p = this.totalpage,
            pages = [];

        if(p<=10){
            for(var i=1;i<=p;i++)
                pages.push(i);
        }else{
            if(pn<=pagecount/2)
                for(var i=1;i<=pagecount;i++)
                    pages.push(i);
            else{
                var end=pn>p-pagecount/2?p:pn+pagecount/2;
                for(var i=pn-pagecount/2-1;i<=end;i++){
                    pages.push(i);
                };
            };
        };

        return pages;
    });

    Pager.prototype.format = function(){
        return {
            page: this.page,
            total: this.total,
            count: this.count,
            pagecount: this.pagecount,
            totalpage: this.totalpage,
            pages: this.pages
        };
    };

    return {
        new: function(page, count, pagecount, total){
            return new Pager(page, count, pagecount, total);
        }
    };

});