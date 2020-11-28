const nodemailer = require('nodemailer')
var connection = require('../database').connection;
const ejs = require('ejs');
const path = require('path');

const kirim_email = function (id, to) { 
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
         user: 'noreply@survplus.id',
         pass: 'Survplus132'
        }
        });
  
  
        var mainOptions = {
            from: 'SI RTRW KAB PEKALONGAN',
            to: to,
            subject: 'Informasi Tata Ruang',
            html: 'Informasi Tata Ruang Anda Disetujui silahkan akses <a href="http://mapgeo.id:8812/peta_informasi_tata_ruang/cetak_rekom/'+id+'">HALAMAN INI</a>'
        };
      
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
  
  };





module.exports = {
    kirim_email
}