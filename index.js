const config = require('./common/config/env.config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
var http = require('http');
const https = require("https");
const fs = require("fs");

const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');


var options = {
    key: fs.readFileSync('./keys/server-key.pem'),
    cert: fs.readFileSync('./keys/server-cert.pem')
};

app.use(morgan('combined'));
app.use(function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DEconstE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);

app.use(morgan('combined'));
var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

// For http
httpServer.listen(8080);
// For https
httpsServer.listen(443);

// app.listen(443, function () {
//     console.log('app listening at port %s', config.port);
// });

// const config = require('./common/config/env.config.js');
//
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
//
// const AuthorizationRouter = require('./authorization/routes.config');
// const UsersRouter = require('./users/routes.config');
//
// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DEconstE');
//     res.header('Access-Control-Expose-Headers', 'Content-Length');
//     res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
//     if (req.method === 'OPTIONS') {
//         return res.send(200);
//     } else {
//         return next();
//     }
// });
//
// app.use(bodyParser.json());
// AuthorizationRouter.routesConfig(app);
// UsersRouter.routesConfig(app);
//
//
// app.listen(config.port, function () {
//     console.log('app listening at port %s', config.port);
// });
