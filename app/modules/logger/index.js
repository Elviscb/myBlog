var fs = require("fs");
var path = require("path");
var morgan = require('morgan');
var moment = require('moment');
var log_file = path.join(__dirname, "err.log");
var visit_log_file = path.join(__dirname, "visit.log");
var visit_log_stream = fs.createWriteStream(visit_log_file);
var levels = ["info","notice","warn","error"];

var log = function(level, req, res, err){
    var txt = [];
    txt.push(moment().format("YYYY-M-D H:m:s"));
    txt.push("[" + level + "]");
    txt.push(err.stack);
    txt.push("\nurl:" + req.url);
    fs.appendFile(log_file, txt.join(" ") + "\n");
};

module.exports = function(req, res, err){
    module.exports.error(req, res, err);
};
for(var i in levels){
    (function(level){
        module.exports[level] = function(req, res, err){
            log(level.toUpperCase(), req, res, err);
        };
    })(levels[i]);
}

module.exports.errLogFile = log_file;
module.exports.visitLogFile = visit_log_file;

module.exports.init = function(router, server){
    var morganStream = morgan('short', {
        stream: visit_log_stream,
        skip: function (req, res) {
            return res.statusCode < 400
        }
    });
    server.use(morganStream);
};