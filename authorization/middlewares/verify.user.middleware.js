const UserModel = require('../../users/models/users.model');
const crypto = require('crypto');

exports.hasAuthValidFields = (req, res, next) => {
    "use strict";
    let errors = [];

    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing email field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            // return res.status(400).send({errors: errors.join(',')});
            return res.status(400).send({"error": true,
                "message": errors.join(',')})
        } else {
            return next();
        }
    } else {
        return res.status(400).send({"error": true,
            "message": 'No email or password.'});
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    UserModel.findTbyEmail(req.body.email)
        .then((user)=>{
            if(!user[0]){
                res.status(200).send({"error": true,
                    "message": 'No users found.'});
            }else{
                let passwordFields = user[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user[0]._id,
                        email: user[0].email,
                        permissionLevel: user[0].permissionLevel,
                        provider: 'email',
                        name: user[0].firstName + ' ' + user[0].lastName,
                    };
                    return next();
                } else {
                    return res.status(200).send({"error": true,
                        "message": 'Invalid email or password.'});
                }
            }
        });
};