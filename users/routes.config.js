const UsersController = require('./controllers/users.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const ADV = config.permissionLevels.ADVANCED_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
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

    app.post('/users', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.insert
    ]);
    app.get('/users', [
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
    ]);
};