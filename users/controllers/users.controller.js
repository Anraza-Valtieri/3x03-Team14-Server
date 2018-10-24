const UserModel = require('../models/users.model');
const crypto = require('crypto');
const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');

var async = require("async");
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

                res.status(200).send({
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    permissionLevel: result.permissionLevel,
                    balanceAmount: result.balanceAmount,
                    points: result.points,
                    phoneNo: result.phoneNo
                });
            }
        });
};
exports.pullPending = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email)
        .then((result) => {
            if (!result || result == null) {
                res.status(200).send({
                    "error": true,
                    "message": 'No user.'
                });
            } else {
                if (req.body.phone.toString() !== result.phoneNo.toString()) {
                    return res.status(403).send({
                        "error": true,
                        "message": 'Nice try MR cunning.'
                    });
                };
                console.log("Pullpending "+ result.phoneNo);
                UserModel.findPendingTransFromWithType(req.body.phone)
                    .then((result2) => {
                        if (!result2 || result2 == null) {
                            res.status(200).send({
                                "error": true,
                                "message": 'No Transaction.'
                            });
                        } else {
                            res.status(200).send({
                                "error": false,
                                "pending": result2
                            });
                        }
                    });
            }
        });
};

exports.pullOthers = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email)
        .then((result) => {
            if (!result || result == null) {
                res.status(200).send({
                    "error": true,
                    "message": 'No user.'
                });
            } else {
                if (req.body.phone.toString() !== result.phoneNo.toString()) {
                    return res.status(403).send({
                        "error": true,
                        "message": 'Nice try MR cunning.'
                    });
                };
                UserModel.findOtherTransFromWithType(result.phoneNo, 0)
                    .then((result2) => {
                        if (!result2 || result2 == null) {
                            res.status(404).send({
                                "error": true,
                                "message": 'No Transaction.'
                            });
                        } else {
                            res.status(200).send({
                                "error": false,
                                "pending": result2
                            });
                        }
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

/*
request: "2"
phone: "91234567"
objectId: "?"
 */
exports.payment = (req, res) => {
    if (req.body.objectId != null && req.body.request != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(404).send({
                    "error": true,
                    "message": 'No user.'
                });
            }
            if (req.body.phone.toString() !== jwtResult.phoneNo.toString()) {
                console.error(req.body.phone + " " + jwtResult.phoneNo);
                return res.status(403).send({
                    "error": true,
                    "message": 'Nice try MR cunning.'
                });
            }
            // CLIENT -> SERVER (Accept payment)
            // Process payments here
            if(req.body.request === 2) {
                UserModel.findTransWithId(req.body.objectId).then((trans) => {
                    if (jwtResult.balanceAmount < trans.amount) {
                        return res.status(403).send({
                            "error": true,
                            "message": 'Not enough in balance to make payment.'
                        });
                    }
                    var deductedAmt = Number(jwtResult.balanceAmount) - Number(trans.amount);
                    UserModel.patchUser(jwtResult.id, {balanceAmount: deductedAmt})
                        .then(() => {
                            UserModel.patchTransaction((req.body.objectId, {type: req.body.request}));
                            console.log("Transaction success!");
                            return res.status(200).send({
                                "error": false,
                                "message": 'Transaction success.'
                            });
                        });
                });
            }
            //// CLIENT -> SERVER (Reject payment)
            if(req.body.request === 3) {
                UserModel.patchTransaction((req.body.objectId, {type: req.body.request}));
                console.log("Transaction success!");
                return res.status(200).send({
                    "error": false,
                    "message": 'Transaction success.'
                });
            }
            // CLIENT -> SERVER (Accept splitting bills)
            if(req.body.request === 4) {
                UserModel.findTransWithId(req.body.objectId).then((trans) => {
                    if (jwtResult.balanceAmount < trans.amount) {
                        return res.status(403).send({
                            "error": true,
                            "message": 'Not enough in balance to make payment.'
                        });
                    }
                    var deductedAmt = Number(jwtResult.balanceAmount) - Number(trans.amount);

                    UserModel.patchUser(jwtResult.id, {balanceAmount: deductedAmt})
                        .then(() => {
                            UserModel.findTransFromWithType(trans.fromId, 8).then((trans2) => {
                                if (trans2 == null){
                                    return res.status(404).send({
                                        error: "true",
                                        message: "transaction cancelled by initiator? doesn't exist anymore"
                                });
                                }
                                var remainingAmt = Number(trans2.amount) - Number(trans.amount);
                                UserModel.patchTransaction(trans2._id, {amount: remainingAmt });
                                UserModel.patchTransaction(trans._id, {type: "1" });
                            });
                            // UserModel.patchTransaction((req.body.objectId, {type: req.body.request}));
                            console.log("Transaction success!");
                            return res.status(200).send({
                                "error": false,
                                "message": 'Transaction success.'
                            });
                        });
                });
            }
            // CLIENT -> SERVER (Reject splitting bills)
            if(req.body.request === 5) {
                UserModel.findTransWithId(res.body.objectId).then((trans3) => {
                    if (trans3 == null) {
                        return res.status(200).send({
                            error: "true",
                            message: "(transaction cancelled by initiator? doesnt exist anymore)"
                        });
                    }
                    UserModel.patchTransaction(trans3._id, {type: 5});
                    return res.status(200).send({
                        "error": false,
                        "message": 'Transaction success.'
                    });
                });
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
const merch = [
    ["F2lQKZ15vPmF0N2r1pbf", "Ryan & Jerry's", 3.5],
    ["2zJ5h5tShgkZSUwULCkf", "Ryan & Jerry's", 8],
    ["uK31AH86ql5CXHudApOO", "Ryan & Jerry's", 6],
    ["ReBPKyFUpyckozetP2ut", "Ryan & Jerry's", 7.5],
    ["pbMIdgJjoxCUKISkxme5", "Ryan & Jerry's", 4.5],
    ["LfWEgsaQQxoPmYfUN7UO", "BING Arcade", 10],
    ["MV1guPtiow1vm4ur1ePH", "BING Arcade", 20],
    ["xQvHpTp6ZuPAobz1Btdv", "BING Arcade", 30],
    ["nUntb7RTAyvJBe6JZJk2", "BING Arcade", 59.9],
    ["7p8XRqsHqknIiwHVPZQh", "BING Arcade", 39.9],
    ["dEnAJHzKKsKrVqo6OEt9", "Quatorze Co.", 555],
    ["1cjnYJBjmqfy6hgonRA8", "Quatorze Co.", 2660.5],
    ["ETbWvghxG88qK0U68GcP", "Quatorze Co.", 1300],
    ["vDxnWXuFg74qfEETkCiJ", "Quatorze Co.", 999],
    ["2XqcYrk0OFhQ59TtGtMN", "Quatorze Co.", 8888]];
exports.qrFunction = (req, res) => {
    console.log(req.body.qrString);
    if(req.body.qrString != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(404).send({
                    "error": true,
                    "message": 'No user.'
                });
            }
            
            for (let i = 0; i < merch; i++) {
                console.log(i);
                if (merch[i][0] === res.body.qrString) {
                    res.status(200).send({
                        "error": false,
                        "merchantName": merch[i][1],
                        "price": merch[i][2]
                    });
                } else {
                    res.status(200).send({
                        "error": true,
                        "message": "Merchant not found!"
                    });
                }
            }
        });
    } else {
        res.status(200).send({
        "error": true,
        "message": 'No QR.'
    });
}
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
                [1, 10],
                [15, 100],
                [160, 1000],
                [1700, 10000]]
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
            res.status(200).send({
                "error": false,
                "message": 'IT IS SNAPPED.'
            });
    });
};

exports.request = (req, res) => {
    if (req.body.request != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                return res.status(404).send({
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

            async.forEachOf(req.body.request, function (value, key, callback) {
                if (jwtResult.phoneNo.toString() === value.toString()){
                    return res.status(200).send({
                        "error": true,
                        "message": 'You cannot have your own number in request.'
                    });
                }
                UserModel.findByPhone(value).then((result) => {
                    if (result == null) {
                        console.log("We are missing this number " + value);
                        transArray.push(value);
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.error(err.message);
                if (transArray.length > 0) {
                    return res.status(200).send({
                        "error": true,
                        "message": 'Some phone numbers does not exist.',
                        "numbers": transArray
                    });
                } else {
                    var results = UserModel.createRequestTransaction(req);
                    return res.status(200).send({
                        "error": false,
                        "message": 'Success.',
                        "phone": results
                    })
                }
            });
        });
    }
};



