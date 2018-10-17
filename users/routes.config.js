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
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        UsersController.getBankDetails
    ]);

    app.post('/topup', [
        // UsersController.insert
        UsersController.topUp,
        UsersController.getBankDetails
    ]);

    app.post('/pay', [
        // UsersController.insert
        UsersController.pay,
        UsersController.getBankDetails
    ]);

    app.post('/request', [
        // UsersController.insert
        UsersController.request,
        UsersController.getBankDetails
    ]);

    app.post('/users', [
        UsersController.insert
    ]);
    app.get('/users', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        UsersController.list
    ]);
    app.get('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById
    ]);
    app.patch('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.patchById
    ]);
    app.delete('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById
    ]);
};