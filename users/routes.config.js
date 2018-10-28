const UsersController = require('./controllers/users.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const ADV = config.permissionLevels.ADVANCED_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.get('/', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("The hunt is on.. - Anraza-Valtieri\n");
    });

    app.get('/root', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Nothing but dead roots here.. - Anraza-Valtieri\n");
    });

    app.get('/admin', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Nothing here - Anraza-Valtieri\n");
    });

    app.get('/mongo', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Here have a mango - Anraza-Valtieri\n");
    });

    app.get('/mongodb', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Only Mangos in DB here - Anraza-Valtieri\n");
    });

    app.get('/delete', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Ooo Why... - Anraza-Valtieri\n");
    });

    app.get('/junwei', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        response.writeHead(301,
            {Location: 'https://www.youtube.com/watch?v=ikBrfCUbkfs'}
        );
        res.end("He is such a fair god - Anraza-Valtieri\n");

    });

    app.get('/woof', function(req, res) {
        response.writeHead(301,
            {Location: 'https://corgiorgy.com/'}
        );
        response.end();
        // res.writeHead(200, {"Content-Type": "text/plain"});
        // res.end("He is such a fair god - Anraza-Valtieri\n");
    });

    app.get('/.well-known/acme-challenge/llM7LhDy0hEh2qeffEBFSUWubJa197t6FTiDZxOin98', function(req, res) {
        res.sendFile(__dirname+'/llM7LhDy0hEh2qeffEBFSUWubJa197t6FTiDZxOin98');
    });
    app.post('/bank', [
        // UsersController.insert
        // PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        ValidationMiddleware.validJWTNeeded,
        UsersController.getBankDetails
    ]);

    app.post('/topup', [
        // UsersController.insert
        ValidationMiddleware.validJWTNeeded,
        UsersController.topUp,
        // UsersController.getBankDetails
    ]);

    app.post('/pay', [
        // UsersController.insert
        ValidationMiddleware.validJWTNeeded,
        UsersController.pay,
        // UsersController.getBankDetails
    ]);

    app.post('/request', [
        // UsersController.insert
        ValidationMiddleware.validJWTNeeded,
        UsersController.request,
        // UsersController.getBankDetails
    ]);

    app.post('/points', [
        // UsersController.insert
        ValidationMiddleware.validJWTNeeded,
        UsersController.points,
        // UsersController.getBankDetails
    ]);

    app.post('/rewards', [
        // UsersController.insert
        ValidationMiddleware.validJWTNeeded,
        UsersController.rewards,
        // UsersController.getBankDetails
    ]);

    app.post('/qr', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.qrFunction
    ]);

    app.post('/payMerch', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.payMerchant
    ]);

    app.post('/payment', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.payment
    ]);

    app.post('/billConfirm', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.billConfirm
    ]);

    app.post('/pullPending', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.pullPending
    ]);

    app.post('/pullOthers', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.pullOthers
    ]);

    app.post('/users', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.insert
    ]);

    /*app.get('/users', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.list
    ]);
    app.get('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById
    ]);
    app.patch('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.patchById
    ]);
    app.delete('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById
    ]);*/
};