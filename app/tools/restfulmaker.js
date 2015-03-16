var _ = require("underscore");

module.exports = function(name, obj, server){
    if(!_.isString(name)) return console.log("make restful for %s failed: argument 1 is not a string", name);
    if(!_.isObject(obj)) return console.log("make restful for %s failed: argument 2 is not a object", name);

    _.each(obj, function(value, key, obj){
        if(!_.isFunction(value)) return true;
        server.get("/"+App.config.restful_prefix+"/"+name+"/"+key,function(req,res){
            var params = _.map(value.toString().match(/\((.*)\)/)[1].split(","),function(v){
                return req.param(v.trim());
            });
            var result = value.apply(global, params);

            if(result.then) result.then(function(result){
                res.json({
                    result: result
                });
                res.end();
            }).catch(function(e){
                res.json({
                    error: e.stack
                });
                res.end();
            });
        });
    });

}