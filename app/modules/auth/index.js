module.exports = function(app){

    //auth
    app.get("/auth", function (req, res) {
        res.render("login", {

        });
    });

};