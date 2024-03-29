const config = require('./common/config/env.config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const https = require("https");
const fs = require("fs");
var helmet = require('helmet');

app.use(helmet());
const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');


var options = {
    key: fs.readFileSync('./keys/privkey.pem'),
    cert: fs.readFileSync('./keys/fullchain.pem'),
    ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    honorCipherOrder: true
};

app.use(morgan('combined'));
app.use(function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
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

app.set('port', process.env.PORT || 3000);
// app.set('host', process.env.HOST || '0.0.0.0');
app.set('host', process.env.HOST || '0.0.0.0');

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

// For http
// httpServer.listen(8080);
// For https
httpsServer.listen(app.get('port'), app.get('host'), function(){
    console.log("Express server listening on port " + app.get('port'));
});