(function (window,undefined,$) {

    var steps = [];

    var Cb = function(){
        $.each(arguments, function(i,v){
            steps.push(v);
        });

        return Cb;
    };

    Cb.init = function(){
        for(i in steps){
            if(typeof steps[i] == "function")
                steps[i].call(this);
            else console.log("steps " + steps[i] + " is't a function, ignored.");
        }
    };

    Cb.config = function(op,value){
        if(op != null && typeof op === 'object')
            for(k in op){
                Cb[k] = op[k];
            }
        else Cb[op] = value;
    };

    window.Cb = Cb;

})(window,undefined,window.jQuery);