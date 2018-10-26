const mongoose = require('mongoose');
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

var async = require("async");
mongoose.connect('mongodb://localhost:27017/bgd', options);
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    permissionLevel: Number,
    phoneNo: Number,
    balanceAmount: Number,
    points: Number
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

userSchema.statics.findByPhone = function (res,cb) {
    return this.model('Users').findOne({"phoneNo": res}, cb);
};

userSchema.statics.findTbyEmail = function (res,cb) {
    return this.model('Users').findOne({"email": res}, cb);
};

userSchema.statics.findTbyEmail2 = function (res,cb) {
    return this.model('Users').findOne({"email": res}, cb);
};

const User = mongoose.model('Users', userSchema);

const transactionSchema = new Schema({
    type: Number,
    fromId: String,
    toId: String,
    amount: Number,
    merchantName: String,
    dateTime: Date,
    read: Boolean
});
transactionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

transactionSchema.findById = function (cb) {
    return this.model('TransactionSchema').find({"_id": this.id}, cb);
};
transactionSchema.statics.findTransFromByPhone = function (res, cb) {
    return this.model('TransactionSchema').find({"fromId": res}, cb);
};

transactionSchema.statics.findTransToByPhone2 = function (res, cb) {
    return this.model('TransactionSchema').find({"toId": res}, cb);
};

transactionSchema.statics.findTByDetails = function (to, from, amt,cb) {
    return this.model('TransactionSchema').findOne({"toId": to, "fromId": from, "amount": amt, "completed": false}, cb);
};

transactionSchema.statics.findTransToWithType = function (to, typeNo, cb) {
    return this.model('TransactionSchema').find({"toId": to, "type": typeNo}, cb);
};

transactionSchema.statics.findTransFromWithType = function (to, typeNo, cb) {
    return this.model('TransactionSchema').find({"fromId": to, "type": typeNo}, cb);
};

transactionSchema.statics.findPendingTransFromWithType = function (to, cb) {
    return this.model('TransactionSchema').find({ $or:[{"toId": to, "type": 0}, {"toId": to, "type": 1}] }, cb);
};

transactionSchema.statics.findOtherTransFrom = function (to, cb) {
    return this.model('TransactionSchema').find({ $or:[{"fromId": to, "type": 2, "read": false}, {"toId": to, "type": 4, "read": false},
            {"toId": to, "type": 6, "read": false}, {"toId": to, "type": 7, "read": false}] }, cb);
};

transactionSchema.statics.findOtherTransFromToClear = function (to, cb) {
    return this.model('TransactionSchema').find({ $or:[{"fromId": to, "type": 2, "read": false},
            {"toId": to, "type": 2, "read": false},
            {"toId": to, "type": 6, "read": false}, {"toId": to, "type": 7, "read": false}] }, cb);
};

transactionSchema.statics.findTransWithId = function (id, cb) {
    return this.model('TransactionSchema').find({"_id": id}, cb);
};
const Pending = mongoose.model('TransactionSchema', transactionSchema);
exports.findPendingTransFromWithType = (to) => {
    return Pending.findPendingTransFromWithType(to)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findOtherTransFromToClear = (to) => {
    return Pending.findOtherTransFromToClear(to)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findOtherTransFrom = (to) => {
    return Pending.findOtherTransFrom(to)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTransWithId = (to) => {
    return Pending.findTransWithId(to)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findOtherTransFromWithType = (to) => {
    return Pending.findOtherTransFromWithType(to)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTransFromWithType = (phone, typeNo) => {
    return Pending.findTransFromWithType(phone, typeNo)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTransToWithType = (phone, typeNo) => {
    return Pending.findTransToWithType(phone, typeNo)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTByPhone = (phone) => {
    return Pending.findTransFromByPhone(phone)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTByPhone2 = (phone) => {
    return Pending.findTransToByPhone2(phone)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findTByDetails = (to, from, amt) => {
    return Pending.findTByDetails(to, from, amt)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                // result = result;
                // delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.createRequestTransaction = (userData) => {
    // console.log("Create Account with Phone "+userData.phoneNo);
    var transArray = [];
    for (i in userData.body.request) {
        const transactions = new Pending();
        transactions.created = userData.body.requester;
        transactions.fromId = userData.body.requester;
        transactions.toId = userData.body.request[i];
        transactions.amount = userData.body.amountPerPax;
        transactions.dateTime = new Date;
        transactions.read = false;
        transactions.type = 0;
        transactions.save();
        transArray.push(userData.body.request[i]);
        console.log("Created request transaction for "+userData.body.requester+" from "+userData.body.request[i]+ " amt: "+userData.body.amountPerPax);
    }
    return transArray;
};

exports.createTransaction = (to, from, amount, type, merch) => {
    // console.log("Create Account with Phone "+userData.phoneNo);
    var transArray = [];
    const transactions = new Pending();
    transactions.created = from;
    transactions.fromId = from;
    transactions.toId = to;
    transactions.amount = amount;
    transactions.dateTime = new Date;
    transactions.merchantName = merch;
    transactions.read = false;
    transactions.type = type;
    transactions.save();
    transArray.push(transactions);
    console.log("Created transaction("+type+") for "+to+" from "+from+ " amt: "+amount);
    return transArray;
};

exports.findTbyEmail = (email) => {
    return User.find({"email": email});
};

exports.findTbyEmail2 = (email) => {
    return User.findOne({"email": email});
};

exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                result = result.toJSON();
                delete result._id;
                delete result.__v;
                return result;
            }
        });
};

exports.findByPhone = (phone) => {
    return User.findByPhone(phone)
        .then((result) => {
            if(result == null || !result || result.length <= 0){
                return null;
            }else {
                // console.log("result: %j", result);
                result = result.toJSON();
                delete result._id;
                delete result.__v;
                return result;
            }
        });
};
exports.createUser = (userData) => {
    return User.findByPhone(userData.phoneNo)
        .then((result) => {
            // console.log("result: %j", result);
            if (result != null) {
                console.log("CANNOT Account with Phone already exist " + userData.phoneNo);
                return 0;
            }
            User.findTbyEmail2(userData.email).then((result) => {
                // console.log("result: %j", result);
                if (result != null) {
                    console.log("CANNOT Account with Phone already exist " + userData.email);
                    return 0;
                }});
            const user = new User(userData);
            // user._id = user.phoneNo;
            user.balanceAmount = 0;
            user.points = 0;

            const nUser = user.save();
            console.log("Create Account with Phone "+userData.phoneNo);

            return nUser;
        });
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, user) {
            if (err) reject(err);
            for (let i in userData) {
                user[i] = userData[i];
            }
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                resolve(updatedUser);
            });
        });
    })
};

exports.patchTransaction = (id, userData) => {
    return new Promise((resolve, reject) => {
        Pending.findById(id, function (err, user) {
            if (err) reject(err);
            for (let i in userData) {
                user[i] = userData[i];
            }
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                resolve(updatedUser);
            });
        });
    })
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.remove({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

exports.delAll = () => {
    return new Promise((resolve, reject) => {
        User.remove({}, (err) => {
            if (err) {
                reject(err);
            } else {
                Pending.remove({}, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(err);
                    }
                });
            }
        });
    });
};
