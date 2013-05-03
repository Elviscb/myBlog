
/*
 * GET home page.
 * and load other routes
 */
var article = require("./article");

module.exports = function(app){

    app.get('/', function(req,res){
        res.render('index', {
            title: 'Express',
            url: "/"
        });
    });

    article(app);

    return app.router;
};