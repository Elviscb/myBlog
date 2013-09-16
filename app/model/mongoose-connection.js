/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-9-2
 * Time: 下午2:45
 */

var mongoose = require('mongoose-q')(require('mongoose'));

mongoose.connect('mongodb://'+
    process.env.MONGOLAB_URI || process.env.MONGOHQ_URI || '127.0.0.1:27017'+
    '/myblog');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

module.exports = mongoose;