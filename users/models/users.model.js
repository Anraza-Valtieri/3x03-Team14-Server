const mongoose = require('mongoose');
mongoose.connect('mongodb://team14ssd_admin:DAzk_F9A@127.0.0.1/bgd');
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

const pendingSchema = new Schema({
    fromId: String,
    toId: String,
    amount: Number,
    dateTime: Date,
    completed: Boolean,
    created: String
});
pendingSchema.statics.findTByPhone = function (res,cb) {
    return this.model('PendingTransactions').find({"fromId": res}, cb);
};

pendingSchema.statics.findTByPhone2 = function (res,cb) {
    return this.model('PendingTransactions').find({"toId": res}, cb);
};
const Pending = mongoose.model('PendingTransactions', pendingSchema);

exports.findTByPhone = (phone) => {
    return Pending.findTByPhone(phone)
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

exports.findTByPhone2 = (phone) => {
    return Pending.findTByPhone2(phone)
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

exports.createTrans = (userData) => {
    // console.log("Create Account with Phone "+userData.phoneNo);
    var transArray = [];
    for (i in userData.body.request) {
        const transactions = new Pending();
        transactions.created = userData.body.requester;
        transactions.fromId = userData.body.request[i];
        transactions.toId = userData.body.requester;
        transactions.amount = userData.body.amountPerPax;
        transactions.dateTime = new Date;
        transactions.completed = false;
        transactions.save();
        transArray.push(userData.body.request[i]);
        console.log("Created request for "+userData.phoneNo+" from "+userData.body.request[i]+ " amt: "+userData.body.amountPerPax);
    }
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
                console.log("result: %j", result);
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
                console.log("result: %j", result);
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
            console.log("result: %j", result);
            if (result != null) {
                console.log("CANNOT Account with Phone already exist " + userData.phoneNo);
                return 0;
            }
            const user = new User(userData);
            // user._id = user.phoneNo;
            user.balanceAmount = 0;
            user.points = 0;

            const nUser = user.save();
            console.log("Create Account with Phone "+userData.phoneNo);
            const transactions = new Pending();
            transactions.created = userData.phoneNo;
            transactions.fromId = userData.phoneNo;
            transactions.toId = userData.phoneNo;
            transactions.amount = 0;
            transactions.dateTime = new Date;
            transactions.completed = true;
            const nTrans = transactions.save();

            return nUser;
            // return user.save();
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

