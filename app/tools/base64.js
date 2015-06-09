/**
 *
 */

exports.encode = function(data){
    var buf = new Buffer(data, "utf8");
    return buf.toString("base64");
};

exports.decode = function(base64data){
    var buf = new Buffer(base64data, "base64");
    return buf.toString("utf8");
};