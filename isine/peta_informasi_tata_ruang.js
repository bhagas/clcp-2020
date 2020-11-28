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
const { kirim_email } = require('../helpper/email')
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
  // res.render('content/peta_informasi_tata_ruang', {nama : req.body.n, nik : req.body.nik, email : req.body.e, no_telp : req.body.t});
  connection.query("SELECT a.kecamatan, kode_k from kecamatan a ", function(err, rows, fields) {

    res.render('content/peta_informasi_tata_ruang', {kec : rows});
  })

});

router.post('/insert_pemohon', function(req, res) {
  console.log(req)
  res.json(req.body);
});


router.get('/list', cek_login, function(req, res) {
  connection.query("SELECT a.* from data_pemohon a where a.deleted=0", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_permohonan_informasi/list', {data : rows});
  })

});

router.get('/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_permohonan_informasi/insert');
});

router.get('/edit/:id', cek_login, function(req, res) {

  connection.query("SELECT a.kecamatan, kode_k from kecamatan a ", function(err, kec, fields) {

    connection.query("SELECT a.*, asWkt(SHAPE) as wkt, DATE_FORMAT(tanggal_surat, '%Y-%m-%d') as tgl_tampil, DATE_FORMAT(tanggal_lahir, '%Y-%m-%d') as tgl_lahir_tampil from data_pemohon a where a.deleted=0 and id="+req.params.id, function(err, rows, fields) {
     
      connection.query("SELECT a.desa from desa a where a.kecamatan='"+rows[0].kec+"'", function(err, desa, fields) {
        res.render('content-backoffice/manajemen_permohonan_informasi/edit', {data : rows, kec, desa});
      })

    })
  })

 
  })
router.get('/delete/:id', function(req, res) {
  connection.query("update data_pemohon set deleted =1 where id="+req.params.id, function(err, rows, fields) {
     res.redirect('/peta_informasi_tata_ruang/list'); 
  })
  })
    router.post('/submit_edit', upload.fields([{ name: 'ktp', maxCount: 1}, { name: 'sertifikat', maxCount: 1}]), function(req, res){
      var post = {}
     post = req.body;
     console.log(post)
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
     //post['SHAPE']= st.geomFromText('POINT('+post['xe']+' '+post['ye']+')', 4326);
            post['SHAPE']= st.geomFromText(post['SHAPE'], 4326);
   
      sql_enak("data_pemohon").where("id", post['id'])
      .update(post).then(function (count) {
      console.log(count);
    })
    .finally(function() {
      //sql_enak.destroy();
      
      if(post['disetujui']==1){
        kirim_email(post.id, post.email);
      }
      res.redirect('/peta_informasi_tata_ruang/list'); 
    });
    });

router.get('/cetak_rekom/:id', function(req, res) {
  connection.query("SELECT a.*, asWkt(SHAPE) as wkt, DATE_FORMAT(tanggal_surat, '%d %M %Y') as tgl_tampil, DATE_FORMAT(CURDATE(), '%d %M %Y') as tgl_hariini from data_pemohon a where a.deleted=0 and id="+req.params.id, function(err, rows, fields) {
    res.render('content-backoffice/manajemen_permohonan_informasi/cetak_gambar', {data : rows});
    // res.json({data:rows})
  })
  })

  router.get('/cetak_lampiran/:id', function(req, res) {
    connection.query("SELECT a.*, asWkt(SHAPE) as wkt, DATE_FORMAT(tanggal_surat, '%d %M %Y') as tgl_tampil, DATE_FORMAT(CURDATE(), '%d %M %Y') as tgl_hariini from data_pemohon a where a.deleted=0 and id="+req.params.id, function(err, rows, fields) {
      res.render('content-backoffice/manajemen_permohonan_informasi/cetak_lampiran', {data : rows});
      // res.json({data:rows})
    })
    })



module.exports = router;
