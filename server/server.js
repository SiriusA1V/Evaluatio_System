const express = require('express');
var constants = require('./constants');
var router = require('./routes/controller');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || constants.APP_URL_PORT;
const session = require('express-session');
const morgan = require('morgan');
const FileStore = require('session-file-store')(session);

app.use(morgan('dev'));
app.use(bodyParser.json());

//後でセッションの時間設定すること
app.use(session({
    secret : 'hfdjgiojdfojoiJ%$#%sdjgiodfij',
    resave : false,
    saveUninitialized : true,
    store: new FileStore(),
}));

app.all('/*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "http://"+constants.WEB_URL+":"+constants.WEB_URL_PORT); //後で編集
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use('/', router);

app.listen(port, () => console.log(`Listening on port ${port}`));