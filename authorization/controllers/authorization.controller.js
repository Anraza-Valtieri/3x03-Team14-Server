const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');
const jwt_duration = require('../../common/config/env.config.js').jwt_expiration_in_seconds;
const crypto = require('crypto');
const UserModel = require('../../users/models/users.model');
var arrayToken = {};
module.exports = {
    arrayToken
};
exports.login = (req, res) => {
    try {
        console.log("AUTH: "+req.body.email);

        let token = jwt.sign(req.body, jwtSecret, { expiresIn: jwt_duration});
        // console.log("AUTH SEND: " + token);
        arrayToken[req.body.email] = token;
        res.status(201).send({accessToken: token});
    } catch (err) {
        console.log(err);
        res.status(500).send({errors: err});
    }
};

exports.refresh_token = (req, res) => {
    try {
        req.body = req.jwt;
        let token = jwt.sign(req.body, jwtSecret);
        res.status(201).send({id: token});
    } catch (err) {
        res.status(500).send({errors: err});
    }
};
