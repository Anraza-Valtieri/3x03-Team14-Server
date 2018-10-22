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
    UserModel.findTbyEmail2(req.body.email)
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
        console.log(req.body.phoneNo + " Requesting topup");
        UserModel.findTbyEmail2(req.jwt.email)
        // UserModel.findByPhone(req.body.phoneNo)
            .then((result) => {
                if (!result || result == null) {
                    res.status(404).send({"error": true,
                        "message": 'No user.'});
                    return null;
                } else {
                    console.log(result.firstName +" "+ result.lastName + " Requesting a topup of "+req.body.topUpAmt);
                    if(req.body.topUpAmt < 0){ return null; }
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
        UserModel.findByPhone(req.body.payer) // Current User
            .then((result) => {
                UserModel.findByPhone(req.body.payee)
                    .then((result2) => {
                        if (!result || result == null) {
                            res.status(200).send({"error": true,
                                "message": 'No user.'});
                            return null;
                        }
                        if (!result2 || result2 == null) {
                            res.status(200).send({"error": true,
                                "message": 'No Payee.'});
                            return null;
                        }
                        else {
                            if (req.body.amount < 0) {
                                return null;
                            }
                            else {
                                if (req.body.amount > result.balanceAmount) {
                                    res.status(500).send({"error": true,
                                        "message": 'Amount too high.'});
                                    console.log("Sending amount too high!");
                                    return null;
                                }
                                var totalAmt = Number(result2.balanceAmount)+Number(req.body.amount);
                                var deductedAmt = Number(result.balanceAmount)-Number(req.body.amount);

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
                                                                " " + result.phoneNo +" " + req.body.amount);
                                                        }else{
                                                            UserModel.patchTransaction(result4.id, {completed: true})
                                                        }
                                                    });
                                                res.status(200).send({"error": false,
                                                    "message": 'Success.'});
                                            });
                                    });
                            }
                        }
                    });
            });
    }
};

exports.request = (req, res) => {
    if (req.body.request != null) {
        //req.body.amountPerPax;
        var result = UserModel.createTrans(req);
            // .then((result) =>{
        console.log("result: %j", result);

        // res.status(200).send({status: "Success", result: result});
        res.status(200).send({"error": false,
            "message": 'Success.'})
                // console.log("Created request for "+req.body.requester+" from "+req.body.request[i]+ " amt: "+req.body.amountPerPax)
            // });

    }
};



