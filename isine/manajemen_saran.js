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
var dbgeo = require("dbgeo");
 var multer = require("multer");
// var MulterResizer = require('multer-resizer');
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


// var resizer = new MulterResizer({
//     multer: multer({storage: multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/foto/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now()+'-'+file.originalname)

//   }
// })}),
//     tasks: [
//         {
//             resize: {
//                 width: 1920,
//                 height: 1080,
//                 suffix: 'resized-big'
//             }
//         },
//         {
//             resize: {
//                 width: 100,
//                 height: 100,
//                 suffix: 'resized-small'
//             }
//         },
//         {
//             cover: {
//                 width: 160,
//                 height: 112,
//                 suffix: 'thumbnail'
//             }
//         }
//     ]
// });
//start-------------------------------------
router.get('/cetak/:id', cek_login, function(req, res) {
   connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where id='"+req.params.id+"' order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.render('content-backoffice/manajemen_saran/cetak', {data : rows});
})

});


router.get('/', cek_login, function(req, res) {
  connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where deleted=0 order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.render('content-backoffice/manajemen_saran/list', {data : rows});
})
});

router.get('/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_saran/insert');
});

router.get('/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where deleted=0 and id='"+req.params.id+"' order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.render('content-backoffice/manajemen_saran/edit', {data : rows});
})
});

router.get('/get_json/:id', function(req, res) {
  connection.query("SELECT *, x(SHAPE) as x, y(SHAPE) as y from saran where deleted=0 and id='"+req.params.id+"' order by id desc", function(err, rows, fields) {
    if (err) throw err;
    datane = rows;
          res.json({data : rows});
    })
});

router.post('/submit_edit', function(req, res){
  var post = {}
 post = req.body;
 console.log(post)

  sql_enak("saran").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_saran'); 
});
});

router.get('/delete/:id', cek_login, function(req, res) {
  // senjata
  // console.log(req.params.id)
  connection.query("update saran SET deleted=1 WHERE id='"+req.params.id+"'", function(err, rows, fields) {
    if (err) throw err;
    numRows = rows.affectedRows;
  })
  res.redirect('/manajemen_saran');
});

router.post('/delete_foto/:id/', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update saran SET foto='' WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
    if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_saran/edit/'+req.params.id);
});

module.exports = router;
