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
  connection.query("SELECT a.kecamatan, kode_k, x(centroid(a.SHAPE)) as xe, y(centroid(a.SHAPE)) as ye  from kecamatan a ", function(err, rows, fields) {

    res.render('content/pola_ruang', {kec : rows});
  })

});
router.get('/get_desa_by_kec', function(req, res) {
  connection.query("SELECT a.desa, kode_d, x(centroid(a.SHAPE)) as xe, y(centroid(a.SHAPE)) as ye from desa a where kecamatan='"+req.query.kec+"'", function(err, rows, fields) {

   res.json(rows)
  })
});

router.get('/cetak/:id', function(req, res) {

  res.render('content/cetak', {kode_desa : req.params.id, nama : req.query.n, nik : req.query.nik, email : req.query.e, no_telp : req.query.t});
});


router.post('/cetak_gambar_insert', upload.fields([{ name: 'ktp', maxCount: 1}, { name: 'sertifikat', maxCount: 1}]), function(req, res) {
  var seconds = sha1(new Date().getTime() / 1000);
  var no_regis = seconds.substr(seconds.length - 5);
  var post = req.body
  post['no_regis'] = no_regis;
  if(req.files['ktp']){
    var nama_file = req.files['ktp'][0].filename;
   // nama_file = nama_file.slice(0, -4)
       post['ktp'] = nama_file;
    }

    if(req.files['sertifikat']){
      var nama_file = req.files['sertifikat'][0].filename;
     // nama_file = nama_file.slice(0, -4)
         post['sertifikat'] = nama_file;
      }
      let shape_backup = req.body.SHAPE;
  post['SHAPE']= st.geomFromText(req.body.SHAPE, 4326);
    sql_enak.insert(post).into("data_pemohon").then(function (id) {
  
    // res.render('content/cetak_gambar',{data_peta : shape_backup, nama : req.body.nama, nik : req.body.nik, email : req.body.email, no_telp : req.body.telp, no_regis : no_regis});
    res.json({status: 'berhasil', idne: id})
  })
  
});
router.get('/cetak_gambar/:id', function(req, res) {
  connection.query("SELECT a.*, asText(SHAPE) as p  from data_pemohon a where id="+req.params.id, function(err, rows, fields) {

    res.render('content/cetak_gambar',{data_peta :rows[0].p, nama : rows[0].nama, nik : rows[0].nik, email :rows[0].email, no_telp : rows[0].telp, no_regis : rows[0].no_regis});
  })
    
  
  
});
// router.get('/cetak_rekomendasi', function(req, res) {
//   res.render('content/cetak_rekomendasi');
// });


module.exports = router;
