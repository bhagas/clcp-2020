var express = require('express')
  , http = require('http')
  , path = require('path')
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , static = require('serve-static')
  , errorHandler =require('errorhandler')
  , passport = require('passport')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , flash=require("connect-flash")
  , LocalStrategy = require('passport-local').Strategy;

var login = require('./isine/login').router;
var peta = require('./isine/topojson');
var upload = require('./isine/upload_file');
var upload_shp = require('./isine/upload_shp');
var user = require('./isine/user');
var fn = require('./isine/ckeditor-upload-image');
var cek_login = require('./isine/login').cek_login;
var profil = require('./isine/profil');
var detail_luas_wilayah = require('./isine/detail_luas_wilayah');
var tujuan_strategi = require('./isine/tujuan_strategi');
var struktur_ruang = require('./isine/struktur_ruang');
var pola_ruang = require('./isine/pola_ruang');
var kawasan_strategis = require('./isine/kawasan_strategis');
var arahan_pengendalian = require('./isine/arahan_pengendalian');
var indikasi_program = require('./isine/indikasi_program');
var aturan_sanksi = require('./isine/aturan_sanksi');
var faq = require('./isine/faq');
var kritik_saran = require('./isine/kritik_saran');
var alur_informasi_tata_ruang = require('./isine/alur_informasi_tata_ruang');
var peta_informasi_tata_ruang = require('./isine/peta_informasi_tata_ruang');

var manajemen_indikasi_program = require('./isine/manajemen_indikasi_program');
var manajemen_saran = require('./isine/manajemen_saran');
var manajemen_kategori_faq = require('./isine/manajemen_kategori_faq');
var manajemen_faq = require('./isine/manajemen_faq');
var manajemen_banner_informasi = require('./isine/manajemen_banner_informasi');
var manajemen_permohonan_informasi = require('./isine/manajemen_permohonan_informasi');
var manajemen_pupz = require('./isine/manajemen_pupz');

var app = express();
var connection = require('./database').connection;
//var mysql2geojson = require("mysql2geojson");
var router = express.Router();
var dbgeo = require("dbgeo");
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


//end dbf dan shp
// all environments
app.set('port', process.env.PORT || 8812);

//app.use(express.favicon());
app.use(function (req, res, next) {

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
app.use(logger('dev'));
app.use(methodOverride());
app.use(static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser() );
app.use(session({ secret: 'bhagasitukeren', cookie: { maxAge : 1200000 },saveUninitialized: true,
               resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());  
// Add headers

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
 var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));  
});
var io = require('socket.io').listen(server, { log: false });

//mulai apps ----------------------------------------------------------
app.use('/autentifikasi', login);
app.use('/peta', peta);
app.use('/upload', upload);
app.use('/upload_shp', upload_shp);
app.use('/user', user);
app.use('/uploadckeditor', fn);
app.use('/profil', profil);
app.use('/detail_luas_wilayah', detail_luas_wilayah);
app.use('/tujuan_strategi', tujuan_strategi);
app.use('/struktur_ruang', struktur_ruang);
app.use('/pola_ruang', pola_ruang);
app.use('/kawasan_strategis', kawasan_strategis);
app.use('/arahan_pengendalian', arahan_pengendalian);
app.use('/indikasi_program', indikasi_program);
app.use('/aturan_sanksi', aturan_sanksi);
app.use('/faq', faq);
app.use('/kritik_saran', kritik_saran);
app.use('/alur_informasi_tata_ruang', alur_informasi_tata_ruang);
app.use('/peta_informasi_tata_ruang', peta_informasi_tata_ruang);

app.use('/manajemen_indikasi_program', manajemen_indikasi_program);
app.use('/manajemen_saran', manajemen_saran);
app.use('/manajemen_kategori_faq', manajemen_kategori_faq);
app.use('/manajemen_faq', manajemen_faq);
app.use('/manajemen_banner_informasi', manajemen_banner_informasi);
app.use('/manajemen_permohonan_informasi', manajemen_permohonan_informasi);
app.use('/manajemen_pupz', manajemen_pupz);


app.get('/', function (req, res) {
  connection.query("SELECT * from banner where deleted=0 ORDER BY id ASC", function(err, rows, fields) {
  connection.query("SELECT a.kecamatan, kode_k, x(centroid(a.SHAPE)) as xe, y(centroid(a.SHAPE)) as ye  from kecamatan a ", function(err, rows, fields) {

      console.log(req.user)
  res.render('content/index', {
        user: req.user,
        data_banner:rows,
        kec : rows
    });
  })
  })
 });


app.get('/backoffice', cek_login, function (req, res) {
  console.log(req.user)
  res.render('content-backoffice/index');
});


// app.get('/4E26CD6CB47148CCFB9334CB15B95495.txt', function (req, res) {
//   console.log(req.user)
//   //res.render('7ECA9DC7A2167A6EB33B60F1DA8B85E1.txt');
//   var file = __dirname + '/4E26CD6CB47148CCFB9334CB15B95495.txt';
//     res.download(file);
// });
// app.listen(800, function () {
//   console.log('Example app listening on port 800!');
//admin
//mysql

app.use(function (req, res, next) {
  res.status(404).send("Halaman yang anda tuju tidak ada!")
})
  
<!-- start socketio connection -->

io.sockets.on('connection', function (socket) {	



});