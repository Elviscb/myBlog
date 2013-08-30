var fs = require("fs"),
	Q = require("q"),
    path = require("path");

module.exports = function(){

    return function(realPath){

    	var deferred = Q.defer();
    	
        fs.exists(realPath, function (exists) {
            if (!exists) {
                //console.log("Can't find file:"+realPath);
            	deferred.resolve(false);
            } else {
                fs.stat(realPath,function(err,stat){
                    if(err) return deferred.reject(err);
                    if (stat.isDirectory()) {
                        if (!(realPath[realPath.length - 1] === "/")) {
                            realPath += "/";
                        }
                        fs.readdir(realPath, function (err, files) {
                            if (err) return deferred.reject(err);
                            deferred.resolve(files);
                        });
                        return console.log("Find dir:" + realPath);
                    } else console.log("Find file:" + realPath);
                    fs.readFile(realPath,function(err,data){
                        if(err) return deferred.reject(err);
                        deferred.resolve(data);
                    });
                });
            }
        });
        return deferred.promise;
    };
};