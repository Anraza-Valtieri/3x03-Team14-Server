const jwt = require('jsonwebtoken'),
    secret = require('../config/env.config.js').jwt_secret,
    crypto = require('crypto');

exports.verifyRefreshBodyField = (req, res, next) => {
    if (req.body && req.body.refresh_token) {
        return next();
    } else {
        return res.status(400).send({error: 'need to pass refresh_token field'});
    }
};

exports.validRefreshNeeded = (req, res, next) => {
    let b = new Buffer(req.body.refresh_token, 'base64');
    let refresh_token = b.toString();
    let hash = crypto.createHmac('sha512', req.jwt.refresh_key).update(req.jwt.user_id + secret).digest("base64");
    if (hash === refresh_token) {
        req.body = req.jwt;
        return next();
    } else {
        return res.status(400).send({error: 'Invalid refresh token'});
    }
};


exports.validJWTNeeded = (req, res, next) => {
    // if (req.headers['user-agent'].toString().contains("Dalvik") && req.headers['user-agent'].toString().contains("Android")) {
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send({
                        "error": true,
                        "message": 'Error.'
                    });
                } else {

                    jwt.verify(authorization[1], new Buffer(secret, 'base64'), function (err, decoded) {
                        if (err) {
                            console.error("JWT invalid");
                            return res.status(403).send(err);
                        } else {
                            req.jwt = jwt.verify(authorization[1], new Buffer(secret, 'base64'));
                            return next();
                        }
                    });
                }
            } catch (err) {
                return res.status(403).send({
                    "error": true,
                    "message": 'Token provided has errors.'
                });
            }
        } else {
            return res.status(403).send({
                "error": true,
                "message": 'No token provided.'
            });
        }
};