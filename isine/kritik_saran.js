var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  ,  sha1 = require('sha1');
var sql_enak = require('../database/mysql_enak.js').connection;
var cek_login = require('./login').cek_login;
var cek_login_google = require('./login').cek_login_google;
var dbgeo = require("dbgeo");
var multer = require("multer");
var st = require('knex-postgis')(sql_enak);
path.join(__dirname, '/public/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use(cookieParser() );
  router.use(session({ secret: 'bhagasitukeren', cookie: { maxAge : 1200000 },saveUninitialized: true, resave: true }));
  router.use(passport.initialize());
  router.use(passport.session());
  router.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/foto/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+'-'+file.originalname)
  }
})

var upload = multer({ storage: storage })

//start-------------------------------------
router.get('/', function(req, res) {
  connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where deleted=0 and publis=1 order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.render('content/kritik_saran', {data : rows});
})
});

router.get('/get_json/:id', function(req, res) {
  connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where deleted=0 and id='"+req.params.id+"' order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.json({data : rows});
    })
});

router.post('/submit_insert', upload.single('foto'), function(req, res){
  var idne ="";
  var post = {}
 post = req.body;
 console.log(post)
if(req.file){
      var nama_file = req.file.filename;
         post['foto'] = nama_file;
      }
post['SHAPE']= st.geomFromText('POINT('+post['x']+' '+post['y']+')', 4326);
delete post['x'];
delete post['y'];

  sql_enak.insert(post).into("saran").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/kritik_saran'); 
});
});


module.exports = router;
