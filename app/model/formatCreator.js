/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-9-10
 * Time: 上午11:51
 * To change this template use File | Settings | File Templates.
 */

var _ = require("underscore");

module.exports = function _r(exec, opt){

    if(_.isString(opt))
        opt = {
            html: opt
        }

    return {
        json: function(req, res, next){
            exec(req, res, next, function(err, data){
                if(_.isNumber(err))
                    res.status(err).json(data);
                else if(err) next(err);
                else res.json(data);
            });
        },
        html: function(req, res, next){
            exec(req, res, next, function(err, data){
                if(_.isNumber(err))
                    res.status(err).render(opt, data);
                else if(err) next(err);
                else res.render(opt.html, data);
            });
        },
        default: function(req, res, next){
            this.html(req, res, next);
        }
    };

}

module.exports.Q = function(exec, opt){


    if(_.isString(opt))
        opt = {
            html: opt
        }

    return {
        json: function(req, res, next){
            exec(req, res, next, function(data){
                res.json(data);
            }).fail(function(err){
                next(err);
            });
        },
        html: function(req, res, next){
            exec(req, res, next, function(data){
                res.render(opt.html, data);
            }).fail(function(err){
                next(err);
            });
        },
        default: function(req, res, next){
            this.html(req, res, next);
        }
    };

}
