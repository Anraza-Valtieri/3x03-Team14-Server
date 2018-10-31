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

    app.get('/a', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("b - Anraza-Valtieri\n");
    });

    app.get('/com', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("That not how you type a url - Anraza-Valtieri\n");
    });

    app.get('/temp', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("This server is only temporary - Anraza-Valtieri\n");
    });

    app.get('/temporal', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("This server is only temporary - Anraza-Valtieri\n");
    });

    app.get('/test', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("A test? - Anraza-Valtieri\n");
    });

    app.get('/testing', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("What are you testing? - Anraza-Valtieri\n");
    });

    app.get('/basilix', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Cool name but I never heard of it...- Anraza-Valtieri\n");
    });

    app.get('/interchange', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("next station, bishan - Anraza-Valtieri\n");
    });

    app.get('/icons', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("50px by 50px - Anraza-Valtieri\n");
    });

    app.get('/images', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("No nudes here - Anraza-Valtieri\n");
    });

    app.get('/image', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("No nudes here - Anraza-Valtieri\n");
    });

    app.get('/examples', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Here is an example - Anraza-Valtieri\n");
    });

    app.get('/scripts', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Are you really trying? - Anraza-Valtieri\n");
    });

    app.get('/javax', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end("<iframe src=\"https://giphy.com/embed/Vuw9m5wXviFIQ\" width=\"480\" height=\"398\" frameBorder=\"0\" class=\"giphy-embed\" allowFullScreen></iframe><p><a href=\"https://giphy.com/gifs/rickroll-rick-astley-never-gonna-give-you-up-Vuw9m5wXviFIQ\">via GIPHY</a></p>");
    });

    app.get('/docs', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Highly classified stuff here - Anraza-Valtieri\n");
    });

    app.get('/junwei', function(req, res) {
        // res.writeHead(200, {"Content-Type": "text/plain"});
        res.writeHead(301,
            {Location: 'https://www.youtube.com/watch?v=ikBrfCUbkfs?autoplay=1'}
        );
        res.end("He is such a fair god - Anraza-Valtieri\n");

    });

    app.get('/junweithegreat', function(req, res) {
        // res.writeHead(200, {"Content-Type": "text/plain"});
        res.writeHead(301,
            {Location: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1'}
        );
        res.end("He is such a fair god - Anraza-Valtieri\n");

    });

    app.get('/lewd', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("I'm disappointed in you... - Anraza-Valtieri\n");
    });

    app.get('/nude', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("I'm disappointed in you... - Anraza-Valtieri\n");
    });

    app.get('/porn', function(req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("I'm disappointed in you... - Anraza-Valtieri\n");
    });

    app.get('/stop', function(req, res) {
        res.writeHead(301,
            {Location: 'https://www.youtube.com/watch?v=YyJRDA21PCs?autoplay=1'}
        );
        res.end();
    });
    app.get('/yamero', function(req, res) {
        res.writeHead(301,
            {Location: 'https://www.youtube.com/watch?v=YyJRDA21PCs?autoplay=1'}
        );
        res.end();
    });

    app.get('/woof', function(req, res) {
        res.writeHead(301,
            {Location: 'https://corgiorgy.com/'}
        );
        res.end();
    });

    // app.get('/.well-known/acme-challenge/llM7LhDy0hEh2qeffEBFSUWubJa197t6FTiDZxOin98', function(req, res) {
    //     res.sendFile(__dirname+'/llM7LhDy0hEh2qeffEBFSUWubJa197t6FTiDZxOin98');
    // });
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