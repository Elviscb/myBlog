/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-9-2
 * Time: 下午2:45
 */

require("cf-autoconfig");
var mongodb = require("mongodb").connect('')
  , mongoose = require('mongoose-q')(require('mongoose'));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

module.exports = mongoose;