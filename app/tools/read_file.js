var fs = require("fs"),
	Q = require("q"),
    path = require("path");

module.exports = function(realPath){

    var deferred = Q.defer();

    fs.exists(realPath, function (exists) {
        if (!exists) {
            deferred.reject("Can't find file:"+realPath);
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
                    return;
                }
                fs.readFile(realPath, {
                    encoding: "utf-8"
                },function(err,data){
                    if(err) return deferred.reject(err);
                    deferred.resolve(data);
                });
            });
        }
    });
    return deferred.promise;
};

module.exports.sync = function(realPath){
    if(fs.existsSync(realPath)){
        if(fs.statSync(realPath).isDirectory()){
            if (!(realPath[realPath.length - 1] === "/")) {
                realPath += "/";
            }
            return fs.readdirSync(realPath);
        }else return fs.readFileSync(realPath);
    };
}