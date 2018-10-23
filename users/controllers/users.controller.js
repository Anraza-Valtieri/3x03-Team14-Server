const UserModel = require('../models/users.model');
const crypto = require('crypto');
const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');
// const userSchema = new Schema({
//     firstName: String,
//     lastName: String,
//     email: String,
//     password: String,
//     permissionLevel: Number,
//     balanceAmount: Number
// });

exports.insert = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body)
        .then((result) => {
            if(!result || result === 0){res.status(400).send({"error": true,
                "message": 'Number already exist!'});}
            else{
                res.status(201).send({id: result._id});
            }
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }

    UserModel.patchUser(req.params.userId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
        });
};


exports.getBankDetails = (req, res) => {
    console.log(req.body.email + " Requesting details");
    console.log("JWT for "+req.body.email +" " + req.jwt.email);
    if(req.jwt.email !== req.body.email)
        return res.status(403).send({
            "error": true,
            "message": 'Nice try MR cunning.'
        });

    UserModel.findTbyEmail2(req.jwt.email)
        .then((result) => {
            if (!result || result == null) {
                res.status(200).send({"error": true,
                    "message": 'No user.'});
            } else {
                console.log(result.firstName +" "+ result.lastName + " Requesting details");

                UserModel.findTByPhone(result.phoneNo)
                    .then((result2) => {
                        UserModel.findTByPhone2(result.phoneNo)
                            .then((result3) => {
                                res.status(200).send({
                                    firstName: result.firstName,
                                    lastName: result.lastName,
                                    email: result.email,
                                    permissionLevel: result.permissionLevel,
                                    balanceAmount: result.balanceAmount,
                                    points: result.points,
                                    phoneNo: result.phoneNo,
                                    pendingTransactionRequest: result2,
                                    pendingTransactionRequested: result3
                                });
                            });
                    });
            }
        });
};

exports.topUp = (req, res) => {
    if (req.body.topUpAmt != null) {
        console.log(req.jwt.email + " Requesting topup");
        UserModel.findTbyEmail2(req.jwt.email)
        // UserModel.findByPhone(req.body.phoneNo)
            .then((result) => {
                if (!result || result == null) {
                    res.status(404).send({"error": true,
                        "message": 'No user.'});
                    return null;
                } else {
                    console.log(result.firstName +" "+ result.lastName + " Requesting a topup of "+req.body.topUpAmt);
                    if(req.body.topUpAmt < 0){ res.status(403).send({"error": true, "message": 'Value Invalid.'}); }
                    if(req.body.topUpAmt > 99999.99){res.status(403).send({"error": true, "message": 'Value too large.'}); }
                    else {
                        var totalAmt = Number(result.balanceAmount)+Number(req.body.topUpAmt);
                        // console.log(totalAmt+ " "+ result.id);
                        UserModel.patchUser(result.id, {balanceAmount: totalAmt})
                            .then(() => {
                                console.log("Top up completed for "+ result.firstName +" "+ result.lastName);
                                res.status(200).send({"error": false,
                                    "message": 'Success.'});
                            });
                    }
                }
            });
    }
};

exports.pay = (req, res) => {
    if (req.body.amount != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if(!jwtResult || jwtResult == null){
                res.status(404).send({
                    "error": true,
                    "message": 'No user.'
                });
            }
            if (req.body.payer.toString() !== jwtResult.phoneNo.toString()) {
                console.log(req.body.payer + " " + jwtResult.phoneNo);
                return res.status(403).send({
                    "error": true,
                    "message": 'Nice try MR cunning.'
                });
            }
            UserModel.findByPhone(jwtResult.phoneNo.toString()) // Current User
                .then((result) => {
                    UserModel.findByPhone(req.body.payee.toString())
                        .then((result2) => {
                            if (!result || result == null) {
                                res.status(200).send({
                                    "error": true,
                                    "message": 'No user.'
                                });
                                return null;
                            }
                            if (!result2 || result2 == null) {
                                res.status(200).send({
                                    "error": true,
                                    "message": 'No Payee.'
                                });
                                return null;
                            }
                            else {
                                if (req.body.amount < 0) {
                                    return null;
                                }
                                else {
                                    if (req.body.amount > result.balanceAmount) {
                                        res.status(500).send({
                                            "error": true,
                                            "message": 'Amount too high.'
                                        });
                                        console.log("Sending amount too high!");
                                        return null;
                                    }
                                    var totalAmt = Number(result2.balanceAmount) + Number(req.body.amount);
                                    var deductedAmt = Number(result.balanceAmount) - Number(req.body.amount);

                                    UserModel.patchUser(result.id, {balanceAmount: deductedAmt})
                                        .then(() => {
                                            UserModel.patchUser(result2.id, {balanceAmount: totalAmt})
                                                .then(() => {
                                                    console.log(result.firstName + " " + result.lastName + " paying "
                                                        + result2.firstName + " " + result2.lastName + " " +
                                                        +req.body.amount + " - Payee new Total: " + totalAmt + " paying left "
                                                        + deductedAmt);
                                                    console.log("Transaction success!");

                                                    UserModel.findTByDetails(result2.phoneNo, result.phoneNo, req.body.amount)
                                                        .then((result4) => {
                                                            if (!result4 || result4 === null) {
                                                                console.log("No relevant transaction found skip " + result2.phoneNo +
                                                                    " " + result.phoneNo + " " + req.body.amount);
                                                            } else {
                                                                UserModel.patchTransaction(result4.id, {completed: true})
                                                            }
                                                        });
                                                    res.status(200).send({
                                                        "error": false,
                                                        "message": 'Success.'
                                                    });
                                                });
                                        });
                                }
                            }
                        });
                });
        });
    }
};

/*
"pointsDeducted": 500,
"cashback": 5
 */
exports.rewards = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
        if (!jwtResult || jwtResult == null) {
            res.status(404).send({
                "error": true,
                "message": 'No user.'
            });
        }
        if (req.body.pointsDeducted != null) {
            if (req.body.cashback != null) {
                console.log(jwtResult.email + " redeeming " +req.body.pointsDeducted+ " points for $" +req.body.cashback);
                if(req.body.pointsDeducted < 0 || jwtResult.points < req.body.pointsDeducted){
                    res.status(403).send({
                        "error": true,
                        "message": 'Not enough points.'
                    });
                }
                var totalAmt = Number(jwtResult.balanceAmount) + Number(req.body.cashback);
                UserModel.patchUser(jwtResult.id, {balanceAmount: totalAmt});
                var totalPoints = Number(jwtResult.points) - Number(req.body.pointsDeducted);
                UserModel.patchUser(jwtResult.id, {balanceAmount: totalPoints});
                res.status(200).send({
                    "error": false,
                    "message": 'Successful.'
                });
            }
        }
    });
};


exports.points = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
        if (!jwtResult || jwtResult == null) {
            res.status(404).send({
                "error": true,
                "message": 'No user.'
            });
        }
        var totalAmt = Number(jwtResult.balanceAmount);

        res.status(200).send({
            "error": false,
            "totalPoints": totalAmt,
            "prices": [
                [5, 200],
                [10, 300],
                [15, 500]]
        });

    });
};

exports.deleteAll = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
        if (!jwtResult || jwtResult == null) {
            res.status(404).send({
                "error": true,
                "message": 'No user.'
            });
        }
        if (jwtResult.name !== "Anraza Valtieri" && req.body.pass !== "Anraza-V") {
            res.status(404).send({
                "error": true,
                "message": 'Invalid.'
            });
        } else
            UserModel.delAll();
    });
};

exports.request = (req, res) => {
    if (req.body.request != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(404).send({
                    "error": true,
                    "message": 'No user.'
                });
            }

            if (req.body.requester.toString() !== jwtResult.phoneNo.toString()) {
                console.log(req.body.payer + " " + jwtResult.phoneNo);
                return res.status(403).send({
                    "error": true,
                    "message": 'Nice try MR cunning.'
                });
            }

            var transArray = [];
            for (i in req.body.request) {
                // UserModel.findTByPhone2(req.body.request[i])
                UserModel.findByPhone(req.body.request[i]).then((result) => {
                    if (!result || result === null) {
                        transArray.push(req.body.request[i]);
                    }
                });
            }
            console.log(transArray);
            if (transArray.length > 0){
                res.status(404).send({
                    "error": true,
                    "message": 'Some phone numbers does not exist.',
                    "missingPhones": transArray
                });
            }else{
                var result = UserModel.createTrans(req);
                console.log("result: %j", result);

                res.status(200).send({
                    "error": false,
                    "message": 'Success.'
                })
            }
        });
    }
};



