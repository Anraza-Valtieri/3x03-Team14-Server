const UserModel = require('../models/users.model');
const crypto = require('crypto');
const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');

var async = require("async");
var lupus = require('lupus');
// const userSchema = new Schema({
//     firstName: String,
//     lastName: String,
//     email: String,
//     password: String,
//     permissionLevel: Number,
//     balanceAmount: Number
// });

let knownNumbers = [];


exports.insert = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');

    // if(/^([a-zA-Z]+([ /]?[a-zA-Z]+)*)+S/.test(req.body.firstName) == true){
    var firstNameReg = /^([a-zA-Z]+([ /]?[a-zA-Z]+)*)+$/;
    if(!req.body.firstName.match(firstNameReg) || req.body.firstName.length > 50){
        console.log("CANNOT firstName pattern does not match pattern " + req.body.firstName);
        return res.status(200).send({error: true, message: "firstName fail"});
    }

    // if(/^([a-zA-Z]+([ /]?[a-zA-Z]+)*)+S/.test(req.body.lastName) == false){
    let lastNameReg = /^([a-zA-Z]+([ /]?[a-zA-Z]+)*)+$/;
    if(!req.body.lastName.match(lastNameReg) || req.body.lastName.length > 50){
        console.log("CANNOT lastName pattern does not match pattern " + req.body.lastName);
        return res.status(200).send({error: true, message: "lastName fail"});
    }

    // if(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/.test(req.body.email) == false){
    let emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if(!req.body.email.match(emailReg)){
        console.log("CANNOT email pattern does not match pattern " + req.body.email);
        return res.status(200).send({error: true, message: "email fail"});
    }
    // if(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]).{8,50}$/.test(req.body.password) == false){
    let passReg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]).{8,50}$/;
    if(!req.body.password.match(passReg)){
        console.log("CANNOT Password pattern does not match pattern " + req.body.password);
        return res.status(200).send({error: true, message: "Password fail"});
    }

    // if(/^([89][0-9]{7})$/.test(req.body.phoneNo) == false){
    let phoneReg = /^([89][0-9]{7})$/;
    if(!req.body.phoneNo.match(phoneReg)){
        console.log("CANNOT Phone does not match pattern " + req.body.phoneNo);
        return res.status(200).send({error: true, message: "phone fail"});
    }

    req.body.email = req.body.email.toLowerCase();

    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body)
        .then((result) => {
            if(!result || result === 0){res.status(200).send({"error": true,
                "message": 'Number already exist!'});}
            else{
                res.status(200).send({"error": false, id: result._id});
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
                UserModel.findTransFromWithType(result.phoneNo, 8).then((trans) => {
                    if (trans != null) {
                        // console.log(trans);
                        return res.status(200).send({
                            firstName: result.firstName,
                            lastName: result.lastName,
                            email: result.email,
                            permissionLevel: result.permissionLevel,
                            balanceAmount: result.balanceAmount,
                            points: result.points,
                            phoneNo: result.phoneNo,
                            ongoingSplit: true
                        });
                    } else {
                        console.log("No Type 8");
                        return res.status(200).send({
                            firstName: result.firstName,
                            lastName: result.lastName,
                            email: result.email,
                            permissionLevel: result.permissionLevel,
                            balanceAmount: result.balanceAmount,
                            points: result.points,
                            phoneNo: result.phoneNo,
                            ongoingSplit: false
                        });
                    }
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
                                "error": false,
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
                UserModel.findOtherTransFrom(result.phoneNo)
                    .then((result2) => {
                        if (!result2 || result2 == null) {
                            res.status(200).send({
                                "error": false,
                                "message": 'No Transaction.'
                            });
                        } else {
                            UserModel.findOtherTransFromToClear(result.phoneNo)
                                .then((result3) => {
                                    if (result3 || result3 !== null) {
                                        for(let i = 0; i < result3.length; i++){
                                            console.log("Setting "+result3[i]._id +" as read true");
                                            UserModel.patchTransaction(result3[i]._id, {read: true});
                                        }
                                    }
                                    return res.status(200).send({
                                        "error": false,
                                        "pending": result2
                                    });
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
                    res.status(200).send({"error": true,
                        "message": 'No user.'});
                    return null;
                } else {
                    console.log(result.firstName +" "+ result.lastName + " Requesting a topup of "+req.body.topUpAmt);
                    if(req.body.topUpAmt < 0){ res.status(200).send({"error": true, "message": 'Value Invalid.'}); }
                    if(req.body.topUpAmt > 99999.99){res.status(200).send({"error": true, "message": 'Value too large.'}); }
                    else {
                        var totalAmt = (Number(result.balanceAmount)+Number(req.body.topUpAmt)).toFixed(2);
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
exports.billConfirm = (req, res) => {
    if (req.body.fromId != null && req.body.request != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(200).send({
                    "error": true,
                    "message": 'No user.'
                });
            } else {
                // CLIENT -> SERVER (pull details of those who accepted the split)
                console.log("req.body.request: " + req.body.request);
                if (req.body.request == 0) {
                    console.log("In Zero");
                    UserModel.findTransFromWithType(jwtResult.phoneNo, 4).then((trans) => {
                        let list = [];
                        let amt = [];
                        UserModel.findTransFromWithType(jwtResult.phoneNo, 8).then((trans2) => {
                            if (trans2 == null) {
                                return res.status(200).send({
                                    "error": true,
                                    "message": "Transaction not found"
                                });
                            }
                            if (trans != null) {

                                // console.log("Length: "+ trans.length);
                                let i = trans.length;
                                // console.log("i is : "+ i);
                                while (i != -1) {
                                    i = i - 1;
                                    // console.log("i now : "+ i);
                                    if (i != -1) {
                                        console.log("Adding Accepted: " + trans[i].toId + " splitAmount: " + trans[i].amount);
                                        list.push(trans[i].toId);
                                        amt.push(trans[i].amount);
                                    }
                                    if (i == -1) {
                                        console.log("Send Accepted: " + list + " splitAmount: " + amt);
                                        return res.status(200).send({
                                            "error": false,
                                            "accepted": list,
                                            "splitAmount": amt,
                                            "receipt": trans2
                                        });
                                    }
                                }
                            } else {
                                return res.status(200).send({
                                    "error": false,
                                    "accepted": [],
                                    "splitAmount": [],
                                    "receipt": trans2
                                });
                            }
                        });
                    });
                }
                // CLIENT -> SERVER (cancel payment)
                if (req.body.request == 2) {
                    console.log("In Two");
                    console.log("CLIENT -> SERVER (cancel payment)");
                    UserModel.findTransFromWithType(jwtResult.phoneNo, 8).then((trans4) => {
                        if (trans4 != null) {
                            console.log("trans4: " + trans4);
                            for (var k = 0; k < trans4.length; k++) {
                                console.log("Deleted a type 8!" + trans4);
                                UserModel.removeTransById(trans4[k]._id);
                            }
                            UserModel.findTransFromWithType(jwtResult.phoneNo, 4).then((trans) => {
                                if (trans != null) {
                                    console.log("trans: " + trans);
                                    for (var i = 0; i < trans.length; i++) {
                                        let amt = Number(trans[i].amount);
                                        UserModel.findByPhone(trans[i].toId).then((result) => {
                                            amt = (Number(amt) + Number(result.balanceAmount)).toFixed(2);
                                            UserModel.patchUser(result._id, {balanceAmount: amt});
                                        });
                                    }
                                }
                                UserModel.findTransFromWithType(jwtResult.phoneNo, 4).then((trans2) => {
                                    if (trans2 != null) {
                                        console.log("trans2: " + trans2);
                                        for (var j = 0; j < trans2.length; j++) {
                                            console.log("Setting " + trans2[j]._id + " as type 7");
                                            UserModel.patchTransaction(trans2[j]._id, {type: 7, read: false});
                                        }
                                    }
                                    UserModel.findTransFromWithType(jwtResult.phoneNo, 1).then((trans3) => {
                                        if (trans3 != null) {
                                            console.log("trans3: " + trans3);
                                            for (var k = 0; k < trans3.length; k++) {
                                                console.log("Deleted a type 1!" + trans3);
                                                UserModel.removeTransById(trans3[k]._id);
                                            }
                                        }
                                        return res.status(200).send({
                                            "error": false
                                        });
                                    });
                                });
                            });
                        }else{
                            return res.status(200).send({
                                "error": true,
                                "message": "No transactions"
                            });
                        }
                    });
                }
                // CLIENT -> SERVER (proceed to pay merchant)
                if (req.body.request == 1) {
                    console.log("In One");
                    console.log("CLIENT -> SERVER (proceed to pay merchant)");
                    UserModel.findTransFromWithType(jwtResult.phoneNo, 4).then((trans) => {
                        console.log("PAY MERCH " + trans);
                        if (trans != null) {
                            for (var i = 0; i < trans.length; i++) {
                                var amountCost = trans[i].amount;
                                let pointsGained = parseFloat(amountCost) / Number(5);
                                pointsGained = Math.round(pointsGained).toFixed(0);
                                UserModel.findByPhone(trans[i].toId).then((result) => {
                                    console.log("Adding " + pointsGained + " points from " + amountCost);
                                    let totalPoints = Number(result.points) + Number(pointsGained);
                                    UserModel.patchUser(result._id, {points: totalPoints});
                                });
                                console.log("Setting " + trans[i]._id + " as type 6");
                                UserModel.patchTransaction(trans[i]._id, {type: 6, read: false});
                            }
                        }
                        UserModel.findTransFromWithType(jwtResult.phoneNo, 8).then((trans2) => {
                            if (trans2 != null) {
                                for (var j = 0; j < trans2.length; j++) {
                                    console.log("Deducted " + trans2[j].amount + " from " + jwtResult.phoneNo);

                                    let deductedAmt = (Number(jwtResult.balanceAmount) - Number(trans2[j].amount)).toFixed(2);
                                    let pointsGained = parseFloat(trans2[j].amount) / Number(5);
                                    pointsGained = Math.round(pointsGained).toFixed(0);
                                    console.log("Adding " + pointsGained + " points from " + trans2[j].amount);
                                    let totalPoints = Number(jwtResult.points) + Number(pointsGained);
                                    UserModel.patchUser(jwtResult.id, {balanceAmount: deductedAmt, points: totalPoints});

                                    console.log("Deleted a type 8!" + trans2);
                                    UserModel.removeTransById(trans2[j]._id);
                                }
                            }
                        });
                        UserModel.findTransFromWithType(jwtResult.phoneNo, 1).then((trans3) => {
                            if(trans3 != null) {
                                for (var k = 0; k < trans3.length; k++) {
                                    console.log("Deleted a type 1!" + trans3);
                                    UserModel.removeTransById(trans3[k]._id);
                                }
                            }
                        });
                        return res.status(200).send({
                            "error": false
                        });
                        
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
    if (req.body.objectId !== null && req.body.request !== null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(200).send({
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
            if (req.body.request === 2) {
                console.log("req.body.request === 2");
                UserModel.findTransWithId(req.body.objectId).then((trans) => {
                    console.log(trans);
                    if (jwtResult.balanceAmount < trans[0].amount) {
                        return res.status(200).send({
                            "error": true,
                            "message": 'Not enough in balance to make payment.'
                        });
                    }else {
                        let deductedAmt = parseFloat(jwtResult.balanceAmount).toFixed(2) - parseFloat(trans[0].amount).toFixed(2);
                        console.log(deductedAmt + " "+ jwtResult.balanceAmount + " "+trans[0].amount );
                        UserModel.patchUser(jwtResult.id, {"balanceAmount": deductedAmt}).then(() => {
                                // UserModel.patchTransaction(req.body.objectId, {type: req.body.request, read: true});
                                UserModel.findByPhone(trans[0].fromId).then((result) => {
                                    if (result || result != null) {
                                        var addedAmt = (parseFloat(result.balanceAmount) + parseFloat(trans[0].amount)).toFixed(2);
                                        UserModel.patchUser(result.id, {"balanceAmount": addedAmt}).then(() => {
                                            console.log("Transaction success!");
                                            UserModel.patchTransaction(req.body.objectId, {type: 2});
                                            return res.status(200).send({
                                                "error": false,
                                                "message": 'Transaction success.'
                                            });

                                        });
                                    }
                                });
                        });
                    }
                });
            }
            //// CLIENT -> SERVER (Reject payment)
            if(req.body.request === 3) {
                console.log("req.body.request === 3");
                UserModel.patchTransaction(req.body.objectId, {type: req.body.request});
                console.log("Transaction success!");
                return res.status(200).send({
                    "error": false,
                    "message": 'Transaction success.'
                });
            }
            // CLIENT -> SERVER (Accept splitting bills)
            if(req.body.request === 4) {
                console.log("req.body.request === 4");
                UserModel.findTransWithId(req.body.objectId).then((trans) => {
                    if (jwtResult.balanceAmount < trans[0].amount) {
                        return res.status(200).send({
                            "error": true,
                            "message": 'Not enough in balance to make payment.'
                        });
                    }else {
                        let deductedAmt = Number(jwtResult.balanceAmount) - Number(trans[0].amount);

                        UserModel.patchUser(jwtResult.id, {balanceAmount: deductedAmt})
                            .then(() => {
                                UserModel.findTransFromWithType(trans[0].fromId, 8).then((trans2) => {
                                    if (trans2 == null) {
                                        return res.status(200).send({
                                            error: "true",
                                            message: "transaction cancelled by initiator? doesn't exist anymore"
                                        });
                                    }else {
                                        var remainingAmt = Number(trans2[0].amount) - Number(trans[0].amount);
                                        UserModel.patchTransaction(trans2[0]._id, {amount: remainingAmt});
                                        UserModel.patchTransaction(trans[0]._id, {type: "4", read: false});
                                    }
                                });
                                // UserModel.patchTransaction((req.body.objectId, {type: req.body.request}));
                                console.log("Transaction success!");
                                return res.status(200).send({
                                    "error": false,
                                    "message": 'Transaction success.'
                                });
                            });
                    }
                });
            }
            // CLIENT -> SERVER (Reject splitting bills)
            if(req.body.request === 5) {
                console.log("req.body.request === 5");
                UserModel.findTransWithId(req.body.objectId).then((trans3) => {
                    if (trans3 == null) {
                        return res.status(200).send({
                            error: "true",
                            message: "(transaction cancelled by initiator? doesnt exist anymore)"
                        });
                    }else {
                        UserModel.patchTransaction(trans3[0]._id, {type: 5});
                        return res.status(200).send({
                            "error": false,
                            "message": 'Transaction success.'
                        });
                    }
                });
            }
        });
    }
};

exports.pay = (req, res) => {
    if (req.body.amount != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if(!jwtResult || jwtResult == null){
                res.status(200).send({
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
                                        res.status(200).send({
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
let prices = [
    [1, 10],
    [15, 100],
    [160, 1000],
    [1700, 10000]];

exports.rewards = (req, res) => {
    UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
        if (!jwtResult || jwtResult == null) {
            res.status(200).send({
                "error": true,
                "message": 'No user.'
            });
        }else {
            if (req.body.reward != null) {
                if (Number(req.body.reward) >= 0 && Number(req.body.reward) < prices.length) {
                    console.log(jwtResult.email + " redeeming " + prices[req.body.reward][1] + " points for $" + prices[req.body.reward][0]);
                    if (jwtResult.points < prices[req.body.reward][1]) {
                        return res.status(200).send({
                            "error": true,
                            "message": 'Not enough points.'
                        });
                    } else {
                        let totalAmt = Number(jwtResult.balanceAmount) + Number(prices[req.body.reward][0]);
                        console.log("totalAmt: "+ totalAmt + " balanceAmount: "+ jwtResult.balanceAmount +" cost: " + prices[req.body.reward][0]);
                        UserModel.patchUser(jwtResult.id, {balanceAmount: totalAmt});
                        let totalPoints = Number(jwtResult.points) - Number(prices[req.body.reward][1]);
                        console.log("Totalpoints: "+ totalPoints+ " points: "+ jwtResult.points +" cost: " + prices[req.body.reward][1]);
                        UserModel.patchUser(jwtResult.id, {points: totalPoints});
                        res.status(200).send({
                            "error": false,
                            "message": 'Successful.'
                        });
                    }
                }
            }
        }
    });
};
var Shop = function(identifier, name, cost) {
    this.identifier = identifier;
    this.name = name;
    this.cost = cost;
};
let ArrShop = [];
ArrShop.push(new Shop("F2lQKZ15vPmF0N2r1pbf", "Ryan & Jerry's", 3.5));
ArrShop.push(new Shop("2zJ5h5tShgkZSUwULCkf", "Ryan & Jerry's", 8));
ArrShop.push(new Shop("uK31AH86ql5CXHudApOO", "Ryan & Jerry's", 6));
ArrShop.push(new Shop("ReBPKyFUpyckozetP2ut", "Ryan & Jerry's", 7.5));
ArrShop.push(new Shop("pbMIdgJjoxCUKISkxme5", "Ryan & Jerry's", 4.5));
ArrShop.push(new Shop("LfWEgsaQQxoPmYfUN7UO", "BING Arcade", 10));
ArrShop.push(new Shop("MV1guPtiow1vm4ur1ePH", "BING Arcade", 20));
ArrShop.push(new Shop("xQvHpTp6ZuPAobz1Btdv", "BING Arcade", 30));
ArrShop.push(new Shop("nUntb7RTAyvJBe6JZJk2", "BING Arcade", 59.9));
ArrShop.push(new Shop("7p8XRqsHqknIiwHVPZQh", "BING Arcade", 39.9));
ArrShop.push(new Shop("dEnAJHzKKsKrVqo6OEt9", "Quatorze Co.", 555));
ArrShop.push(new Shop("1cjnYJBjmqfy6hgonRA8", "Quatorze Co.", 2660.5));
ArrShop.push(new Shop("ETbWvghxG88qK0U68GcP", "Quatorze Co.", 1300));
ArrShop.push(new Shop("vDxnWXuFg74qfEETkCiJ", "Quatorze Co.", 999));
ArrShop.push(new Shop("2XqcYrk0OFhQ59TtGtMN", "Quatorze Co.", 8888));

exports.qrFunction = (req, res) => {
    console.log(req.body.qrString);
    if(req.body.qrString != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(200).send({
                    "error": true,
                    "message": 'No user.'
                });
            }else {
                let detail = ArrShop.find(p=>p.identifier===req.body.qrString);
                if (detail !== undefined){
                    return res.status(200).send({
                        "error": false,
                        "merchantName": detail.name,
                        "price": detail.cost
                    });
                }else {
                    res.status(200).send({
                        "error": true,
                        "message": 'No QR.'
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

/*
{
   qrString: "asdasdasdasd",
   payer: "91234567"
}

{
    qrString: "asdasdasdas",
    initiator: "91234567",
    splitBetween: ["91234567", "anotherNumber1", "anotherNumber2"]
    splitAmount: ["amount", "amount1", "amount2"]
}
 */
exports.payMerchant = (req, res) => {
    console.log(req.body.qrString);
    if(req.body.qrString != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                res.status(200).send({
                    "error": true,
                    "message": 'No user.'
                });
            }else {// Single Payment
                if(req.body.hasOwnProperty("initiator")){
                    // console.log(i);
                    let detail = ArrShop.find(p=>p.identifier===req.body.qrString);
                    if (detail !== undefined) {
                        if (parseFloat(detail.cost.toFixed(2)) > parseFloat(jwtResult.balanceAmount.toFixed(2))) {
                            console.log("Sending amount too high! "+detail.cost);
                            return res.status(200).send({
                                "error": true,
                                "message": 'You do not have enough.'
                            });
                        }else{
                            let totalAmt = parseFloat(Number(jwtResult.balanceAmount).toFixed(2)) - parseFloat(detail.cost.toFixed(2));
                            UserModel.patchUser(jwtResult.id, {balanceAmount: totalAmt});
                            let pointsGained = parseFloat(detail.cost)/Number(5);
                            pointsGained = Math.round(pointsGained).toFixed(0);
                            console.log("pointsGained: "+pointsGained);
                            let totalPoints = Number(jwtResult.points) + Number(pointsGained);
                            console.log("totalPoints: "+ totalPoints +" points: "+jwtResult.points +" pointsGained: "+pointsGained);
                            totalPoints = Math.round(totalPoints).toFixed(0);
                            UserModel.patchUser(jwtResult.id, {points: totalPoints});
                            return res.status(200).send({
                                "error": false
                            });
                        }

                    }
                }else{ // SPLIT bill
                    console.log("SPLIT BILL");
                    let detail = ArrShop.find(p=>p.identifier===req.body.qrString);
                    if (detail !== undefined){
                        console.log("DETAILS: " +detail); // blueberries
                        if(req.body.splitBetween != null && req.body.splitBetween.length > 0) {
                            if(req.body.splitAmount != null && req.body.splitAmount.length > 0) {
                                let sum = req.body.splitAmount.reduce((a, b) => Number(a) + Number(b), 0);
                                sum = sum.toFixed(2);
                                console.log("SUM: " +sum);
                                if (parseFloat(sum) === parseFloat(detail.cost)) {
                                    req.body.splitAmount.pop();
                                    if (Number(jwtResult.balanceAmount) > Number(sum)){
                                        let transArray = [];
                                        console.log("jwtResult.balanceAmount > sum");
                                        if (req.body.splitBetween.includes(jwtResult.phoneNo.toString())){
                                            console.log("req.body.splitBetween.includes(jwtResult.phoneNo.toString() TRUE");
                                            return res.status(200).send({
                                                "error": true,
                                                "message": 'You cannot have your own number in request.'
                                            });
                                        }else {
                                            console.log("req.body.splitBetween.includes(jwtResult.phoneNo.toString() FALSE");

                                            lupus(0, req.body.splitBetween.length, function(n) {
                                                console.log("We're on:", n);
                                                UserModel.findByPhone(req.body.splitBetween[n]).then((result) => {
                                                    if (result == null) {
                                                        console.log("We are missing this number " + req.body.splitBetween[n]);
                                                        transArray.push(req.body.splitBetween[n]);
                                                        // callback();
                                                        // return res.status(200).send({
                                                        //     "error": true,
                                                        //     "message": 'Some phone numbers does not exist.',
                                                        //     "numbers": req.body.splitBetween[n]
                                                        // });
                                                    }
                                                });
                                            }, function() {
                                                if (transArray.length > 0) {
                                                    return res.status(200).send({
                                                        "error": true,
                                                        "message": 'Some phone numbers does not exist.',
                                                        "numbers": transArray
                                                    });
                                                } else {
                                                    console.log("Checking transaction 8s");
                                                    UserModel.createTransaction(jwtResult.phoneNo, jwtResult.phoneNo, sum, 8, detail.name);
                                                    console.log("Splitbetween Length: "+req.body.splitBetween.length);

                                                    for (var q = 0; q < req.body.splitBetween.length; q++){
                                                        UserModel.createTransaction(req.body.splitBetween[q],
                                                            jwtResult.phoneNo, req.body.splitAmount[q] , 1, detail.name);
                                                    }
                                                    console.log('All done!');
                                                    return res.status(200).send({
                                                        "error": false
                                                    });
                                                }

                                            });

                                            // for (let z = 0; z < req.body.splitBetween.length; z++) {
                                            //     console.log(z);
                                            //     UserModel.findByPhone(req.body.splitBetween[z]).then((result) => {
                                            //         if (result == null) {
                                            //             console.log("We are missing this number " + req.body.splitBetween[z]);
                                            //             transArray.push(req.body.splitBetween[z]);
                                            //             // callback();
                                            //             return res.status(200).send({
                                            //                 "error": true,
                                            //                 "message": 'Some phone numbers does not exist.',
                                            //                 "numbers": req.body.splitBetween[z]
                                            //             });
                                            //         }
                                            //     });
                                            //     if (z == req.body.splitBetween.length - 1) {
                                            //         console.log("Z-1");
                                            //         if (transArray.length > 0) {
                                            //             return res.status(200).send({
                                            //                 "error": true,
                                            //                 "message": 'Some phone numbers does not exist.',
                                            //                 "numbers": transArray
                                            //             });
                                            //         } else {
                                            //             console.log("Checking transaction 8s");
                                            //             UserModel.createTransaction(jwtResult.phoneNo, jwtResult.phoneNo, sum, 8, detail.name);
                                            //             console.log("Splitbetween Length: "+req.body.splitBetween.length);
                                            //
                                            //             for (var q = 0; q < req.body.splitBetween.length; q++){
                                            //                 UserModel.createTransaction(req.body.splitBetween[q],
                                            //                     jwtResult.phoneNo, req.body.splitAmount[q] , 1, detail.name);
                                            //             }
                                            //             return res.status(200).send({
                                            //                 "error": false
                                            //             });
                                            //         }
                                            //     }
                                            // }
                                        }
                                    }else{
                                        return res.status(200).send({
                                            "error": true,
                                            "message": "You do not have enough to cover the whole price!"
                                        });
                                    }
                                }else{
                                    return res.status(200).send({
                                        "error": true,
                                        "message": "Total amount is invalid!"
                                    });
                                }
                            } else{
                                return res.status(200).send({
                                    "error": true,
                                    "message": 'Split amount error'
                                });
                            }
                        } else {
                            return res.status(200).send({
                                "error": true,
                                "message": 'Split between error'
                            });
                        }
                    }
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
            res.status(200).send({
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
            res.status(200).send({
                "error": true,
                "message": 'No user.'
            });
        }
        if (jwtResult.name !== "Anraza Valtieri" && req.body.pass !== "Anraza-V") {
            res.status(200).send({
                "error": true,
                "message": 'Invalid.'
            });
        } else
            // UserModel.delAll();
            res.status(200).send({
                "error": false,
                "message": 'IT IS SNAPPED. But you are not thanos'
            });
    });
};

exports.request = (req, res) => {
    if (req.body.request != null) {
        UserModel.findTbyEmail2(req.jwt.email).then((jwtResult) => {
            if (!jwtResult || jwtResult == null) {
                return res.status(200).send({
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

