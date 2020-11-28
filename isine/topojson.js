var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , cookieParser = require('cookie-parser');
 var cek_login = require('./login').cek_login;
var dbgeo = require("dbgeo");
var deasync = require("deasync");

  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  router.use(cookieParser() );
  router.use(session({ secret: 'bhagasitukeren', cookie: { maxAge : 1200000 },saveUninitialized: true, resave: true }));
  router.use(passport.initialize());
  router.use(passport.session());
  
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


   router.get('/list_polaruang_updated', function(req, res){
    //connection.connect();
   // console.log(req.query.kode_kab)
    var a = '';
    var data = [];
     var done = false;


    if(req.query.x != undefined && req.query.y != undefined){
      a = "where ST_Within(GeomFromText('POINT("+req.query.x+" "+req.query.y+")', 1),a.SHAPE) ";
    }else if(req.query.p != undefined){
      a = "where ST_Intersects(a.SHAPE, GeomFromText('"+req.query.p+"', 1)) ";
    }
  
        var admin = [];
      done = false;
       connection.query("SELECT AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+req.query.p+"', 1))) as geometry, a.kecamatan FROM kecamatan a "+a, function(err, rows, fields) {
       if (err) throw err;
      admin = rows
        done = true;
     });
       deasync.loopWhile(function(){return !done;});

         admin.forEach(function(item, index){
             done = false;
              connection.query("SELECT AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+item.geometry+"', 1))) as geometry, a.desa FROM desa a where ST_Intersects(a.SHAPE, GeomFromText('"+item.geometry+"', 1))", function(err, rows, fields) {
              if (err) throw err;
             admin[index].desa = rows
               done = true;
            });
              deasync.loopWhile(function(){return !done;});

              //ambil pola ruang
              admin[index].desa.forEach(function(itemx, indexz){
                  done = false;
                        connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+itemx.geometry+"', 3))" , function(err, rows, fields) {
                     if (err) throw err;
                      admin[index].desa[indexz].pola_ruang = rows;
                       done = true;  
                      
                     });
                         deasync.loopWhile(function(){return !done;});
                         //ambil intercept
                          admin[index].desa[indexz].pola_ruang.forEach(function(itemm, indexx){
                             var done = false;
                               connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemx.geometry+"', 3))) as polygon FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+itemx.geometry+"', 3)) and a.kode="+itemm.kode , function(err, rows, fields) {
                              if (err) throw err;
                                 admin[index].desa[indexz].pola_ruang[indexx].irisan = rows;
                                 done = true;  
                             
                            });
                               deasync.loopWhile(function(){return !done;});

                              
                               // data[indexx].irisan.forEach(function(itemmm, indexxx){
                               //     done = false;
                               //     connection.query("SELECT distinct(a.rtgl) as eksisting, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemmm.polygon+"'))) as polygon FROM guna_lahan a where ST_Intersects(a.SHAPE, GeomFromText('"+itemmm.polygon+"')) " , function(err, rowst, fields) {
                               //     if (err) throw err;
                               //    data[indexx].irisan[indexxx].eksisting = rowst;
                                 
                               //      done = true;  
                               //    });
                               //     deasync.loopWhile(function(){return !done;});
                               // })
                           })
              })
         })
  
   



       
      //  console.log(data)
  
          res.send(JSON.stringify(admin))
    //connection.end();
    })
         router.get('/list_polaruang', function(req, res){
        //connection.connect();
       // console.log(req.query.kode_kab)
        var a = '';
        var data = [];
         var done = false;


        if(req.query.x != undefined && req.query.y != undefined){
          a = "where ST_Within(ST_GeomFromText('POINT("+req.query.x+" "+req.query.y+")', 1),a.SHAPE) ";
        }else if(req.query.p != undefined){
          a = "where ST_Intersects(a.SHAPE, ST_GeomFromText('"+req.query.p+"', 1)) ";
        }
      
            var admin = [];
          done = false;
           connection.query("SELECT AsWkt(ST_Intersection(a.SHAPE, ST_GeomFromText('"+req.query.p+"', 1))) as geometry, a.kecamatan, a.kode_k FROM kecamatan a "+a, function(err, rows, fields) {
           if (err) throw err;
          admin = rows
            done = true;
         });
           deasync.loopWhile(function(){return !done;});

             admin.forEach(function(item, index){
                 done = false;
                  connection.query("SELECT AsWkt(ST_Intersection(a.SHAPE, ST_GeomFromText('"+item.geometry+"', 1))) as geometry, a.desa FROM desa a where ST_Intersects(a.SHAPE, ST_GeomFromText('"+item.geometry+"', 1)) and a.kode_k = '"+item.kode_k+"'", function(err, rows, fields) {
                console.log("SELECT AsWkt(ST_Intersection(a.SHAPE, ST_GeomFromText('"+item.geometry+"', 1))) as geometry, a.desa FROM desa a where ST_Intersects(a.SHAPE, ST_GeomFromText('"+item.geometry+"', 1)) and a.kode_k = '"+item.kode_k+"'")
                  if (err) throw err;
                 admin[index].desa = rows
                   done = true;
                });
                  deasync.loopWhile(function(){return !done;});
             })
       // connection.query("SELECT asWkt(a.SHAPE) as geometry a.desa, a.kode_d FROM desa a"+a, function(err, rows, fields) {
        
     done = false;
     if(req.query.x != undefined && req.query.y != undefined){
       a = "where ST_Within(ST_GeomFromText('POINT("+req.query.x+" "+req.query.y+")', 1),a.SHAPE) ";
     }else if(req.query.p != undefined){
       a = "where ST_Intersects(a.SHAPE, ST_GeomFromText('"+req.query.p+"', 1)) ";
     }
           connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode FROM polaruang_2020 a "+a , function(err, rows, fields) {
        if (err) throw err;
         data = rows;
          done = true;  
         
        });
            deasync.loopWhile(function(){return !done;});


            data.forEach(function(itemm, indexx){
               var done = false;
                 connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, ST_GeomFromText('"+req.query.p+"', 1))) as polygon FROM polaruang_2020 a "+a+" and a.kode="+itemm.kode , function(err, rows, fields) {
                if (err) throw err;
                   data[indexx].irisan = rows;
                   done = true;  
               
              });
                 deasync.loopWhile(function(){return !done;});

              
                 var done = false;
                 connection.query("SELECT terbatas, bersyarat,dilarang, ketentuan, keterangan, diizinkan from pupz where id_pola_ruang="+itemm.kode , function(err, rows, fields) {
                if (err) throw err;
                   data[indexx].pupz = rows;
                   done = true;  
               
              });
                 deasync.loopWhile(function(){return !done;});
                 // data[indexx].irisan.forEach(function(itemmm, indexxx){
                 //     done = false;
                 //     connection.query("SELECT distinct(a.rtgl) as eksisting, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemmm.polygon+"'))) as polygon FROM guna_lahan a where ST_Intersects(a.SHAPE, GeomFromText('"+itemmm.polygon+"')) " , function(err, rowst, fields) {
                 //     if (err) throw err;
                 //    data[indexx].irisan[indexxx].eksisting = rowst;
                   
                 //      done = true;  
                 //    });
                 //     deasync.loopWhile(function(){return !done;});
                 // })
             })
          //  console.log(data)
      
              res.send(JSON.stringify({pola_ruang : data, admin : admin}))
        //connection.end();
        })

             router.get('/list_polaruang_desa/:id', function(req, res){
            //connection.connect();
           // console.log(req.query.kode_kab)
            var a = '';
            var data = [];
             var done = false;


           
          
                var admin = [];
             

                
                     done = false;
                      connection.query("SELECT AsWkt(a.SHAPE) as geometry, a.desa, kecamatan FROM desa a where a.kode_d = "+req.params.id, function(err, rows, fields) {
                      if (err) throw err;
                     admin = rows
                       done = true;
                    });
                      deasync.loopWhile(function(){return !done;});
                 
           // connection.query("SELECT asWkt(a.SHAPE) as geometry a.desa, a.kode_d FROM desa a"+a, function(err, rows, fields) {
          
            
         done = false;
               connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, a.pemanfaata, a.pengendali FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3))" , function(err, rows, fields) {
            if (err) throw err;
             data = rows;
              done = true;  
             
            });
                deasync.loopWhile(function(){return !done;});


                data.forEach(function(itemm, indexx){
                   var done = false;
                     connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3))) as polygon FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3)) and a.kode="+itemm.kode , function(err, rows, fields) {
                    if (err) throw err;
                       data[indexx].irisan = rows;
                       done = true;  
                   
                  });
                     deasync.loopWhile(function(){return !done;});


                     var done = false;
                     connection.query("SELECT terbatas, bersyarat,dilarang, ketentuan, keteranga, diizinkan from pupz where id_pola_ruang="+itemm.kode , function(err, rows, fields) {
                    if (err) throw err;
                       data[indexx].pupz = rows;
                       done = true;  
                   
                  });
                     deasync.loopWhile(function(){return !done;});

                    
                     // data[indexx].irisan.forEach(function(itemmm, indexxx){
                     //     done = false;
                     //     connection.query("SELECT distinct(a.rtgl) as eksisting, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemmm.polygon+"'))) as polygon FROM guna_lahan a where ST_Intersects(a.SHAPE, GeomFromText('"+itemmm.polygon+"')) " , function(err, rowst, fields) {
                     //     if (err) throw err;
                     //    data[indexx].irisan[indexxx].eksisting = rowst;
                       
                     //      done = true;  
                     //    });
                     //     deasync.loopWhile(function(){return !done;});
                     // })
                 })
              //  console.log(data)
          
                  res.send(JSON.stringify({pola_ruang : data, admin : admin}))
            //connection.end();
            })

                router.get('/list_polaruang_kecamatan/:id', function(req, res){
            //connection.connect();
           // console.log(req.query.kode_kab)
            var a = '';
            var data = [];
             var done = false;


           
          
                var admin = [];
             

                
                     done = false;
                      connection.query("SELECT AsWkt(a.SHAPE) as geometry, kecamatan, kode_k FROM kecamatan a where a.kode_k = "+req.params.id, function(err, rows, fields) {
                      if (err) throw err;
                     admin = rows
                       done = true;
                    });
                      deasync.loopWhile(function(){return !done;});
                 
           // connection.query("SELECT asWkt(a.SHAPE) as geometry a.desa, a.kode_d FROM desa a"+a, function(err, rows, fields) {
        
            
         done = false;
               connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, a.pemanfaata, a.pengendali FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3))" , function(err, rows, fields) {
            if (err) throw err;
             data = rows;
              done = true;  
             
            });
                deasync.loopWhile(function(){return !done;});
               


                data.forEach(function(itemm, indexx){
                  // console.log("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3))) as polygon FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3)) and a.kode="+itemm.kode)
                   var done = false;
                     connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3))) as polygon FROM pola_ruang a where ST_Intersects(a.SHAPE, GeomFromText('"+admin[0].geometry+"', 3)) and a.kode="+itemm.kode , function(err, rows, fields) {
                    if (err){
                      // console.log(err)
                      // delete data[indexx];
                      data[indexx].irisan = []
                    }else{
                      // console.log(rows.length, data[indexx].pemanfaata, data[indexx].kode)
                   

                        data[indexx].irisan = rows;
                   
                    
                    }
                    done = true; 
                   
                  });
                     deasync.loopWhile(function(){return !done;});

                    
                     // data[indexx].irisan.forEach(function(itemmm, indexxx){
                     //     done = false;
                     //     connection.query("SELECT distinct(a.rtgl) as eksisting, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemmm.polygon+"'))) as polygon FROM guna_lahan a where ST_Intersects(a.SHAPE, GeomFromText('"+itemmm.polygon+"')) " , function(err, rowst, fields) {
                     //     if (err) throw err;
                     //    data[indexx].irisan[indexxx].eksisting = rowst;
                       
                     //      done = true;  
                     //    });
                     //     deasync.loopWhile(function(){return !done;});
                     // })
                 })
              //  console.log(data)
          
                  res.send(JSON.stringify({pola_ruang : data, admin : admin}))
            //connection.end();
            })
      router.get('/json_kec', function(req, res){
  //connection.connect();
  //console.log(req.query)
  connection.query("SELECT x(centroid(a.SHAPE)) as x, y(centroid(a.SHAPE)) as y, a.kecamatan FROM kecamatan a" , function(err, rows, fields) {
    if (err) throw err;

   //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

  //res.end(JSON.stringify(rows))

    // MySQL query...
  //ambil geojson
  res.send(JSON.stringify(rows))
  });

  //connection.end();
  })
   router.get('/topojson_kec', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(kecamatan.SHAPE) as geometry, kecamatan, kode_k, (select count(desa.id) from desa where desa.kode_k = kecamatan.kode_k) as jml_desa FROM kecamatan "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })

   router.get('/topojson_desa', function(req, res){
//connection.connect();
//console.log(req.query)
if(req.query.kode_desa){
  var tambahan = " and kode_d= '"+req.query.kode_desa+"'";
}else{
  var tambahan = "";
    
}
connection.query("SELECT asWkt(a.SHAPE) as geometry, a.desa, a.kode_d FROM desa a  WHERE mbrIntersects(a.SHAPE,  GeomFromText('POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))', 1))"+tambahan, function(err, rows, fields) {
  if (err) throw err;

 //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

//res.end(JSON.stringify(rows))

  // MySQL query...
//ambil geojson
  dbgeo.parse({
  "data": rows,
  "outputFormat": "topojson",
  "geometryColumn": "geometry",
  "geometryType": "wkt"
},function(error, result) {
  if (error) {
    return console.log(error);
  }
  // This will log a valid GeoJSON object
 // console.log(result)  
  res.send(JSON.stringify(result))
});
});

//connection.end();
})
     router.get('/topojson_desa_statis', function(req, res){
//connection.connect();
//console.log(req.query)
connection.query("SELECT asWkt(a.SHAPE) as geometry, a.desa, a.kode_d FROM desa a  ", function(err, rows, fields) {
  if (err) throw err;

 //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

//res.end(JSON.stringify(rows))

  // MySQL query...
//ambil geojson
  dbgeo.parse({
  "data": rows,
  "outputFormat": "topojson",
  "geometryColumn": "geometry",
  "geometryType": "wkt"
},function(error, result) {
  if (error) {
    return console.log(error);
  }
  // This will log a valid GeoJSON object
 // console.log(result)  
  res.send(JSON.stringify(result))
});
});

//connection.end();
})

   router.get('/jaringan_perpipaan', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(perpipaan.SHAPE) as geometry, jenis, perwujudan, zonasi FROM perpipaan "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
     router.get('/jenis_tanah', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(jenistanahgeo.SHAPE) as geometry, jenis_tana, warna FROM jenistanahgeo "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })

     router.get('/kelerengan', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(kelerengangeo.SHAPE) as geometry, lereng, warna FROM kelerengangeo "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
     router.get('/kesesuaian_lahan', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(kesesuaianlahangeo.SHAPE) as geometry, skor_total, fungsi_kaw FROM kesesuaianlahangeo "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
          router.get('/morfologi_wilayah', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(SHAPE) as geometry, morfologi, warna FROM morfologigeo "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
          router.get('/pelayanan_air_minum', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(SHAPE) as geometry, keterangan, lokasi FROM air_minum "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
             router.get('/jaringan_energi', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(SHAPE) as geometry, lokasi_spb, perwujudan, zonasi FROM jaringan_energi "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
                   router.get('/jaringan_pengelolaan_lingkungan', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(SHAPE) as geometry, lokasi_tps, perwujudan, zonasi FROM persampahan "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
                        router.get('/jaringan_sumber_daya_air', function(req, res){
 //connection.connect();
 //console.log(req.query)
 if(req.query.id_kec){
   var tambahan = "where id_kec= '"+req.query.id_kec+"'";
 }else{
   var tambahan = "";
     
 }
 connection.query("SELECT asWkt(SHAPE) as geometry, perwujudan, zonasi, jenis FROM sumber_daya_air "+tambahan, function(err, rows, fields) {
   if (err) throw err;

  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 //res.end(JSON.stringify(rows))

   // MySQL query...
 //ambil geojson
   dbgeo.parse({
   "data": rows,
   "outputFormat": "topojson",
   "geometryColumn": "geometry",
   "geometryType": "wkt"
 },function(error, result) {
   if (error) {
     return console.log(error);
   }
   // This will log a valid GeoJSON object
  // console.log(result)  
   res.send(JSON.stringify(result))
 });
 });

 //connection.end();
 })
     router.get('/jaringan_telekomunikasi', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, lokasi_bts, tahun, perwujudan, zonasi FROM telekomunikasi "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })

       router.get('/prasarana_kelistrikan', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, ket, perwujudan, zonasi FROM kelistrikan "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
       //belum
        router.get('/jaringan_sda', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry FROM rencana_jaringan_sda_(sungai)_geo "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
         router.get('/jalan_tol', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    //belum
    connection.query("SELECT asWkt(SHAPE) as geometry FROM rencana_jaringan_transportasi_darat_(tol)_geo "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
          router.get('/jalan', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    //belum
    connection.query("SELECT asWkt(the_geom) as geometry, nm_ruas FROM daftar_induk2 "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
         router.get('/rencana_jalan', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, layer FROM rencanajalangeo "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
         router.get('/kawasan_strategis', function(req, res){
    //connection.connect();
    //console.log(req.query)
    var tambahan = "where idtipe= '"+req.query.idtipe+"' and sudut_kepe='"+req.query.sudut_kepe+"' ";
    connection.query("SELECT asWkt(SHAPE) as geometry, namobj, idtipe, orde02 as sudut_kepe FROM mergekawstrategis_2020 "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })

    router.get('/sr_line', function(req, res){
      //connection.connect();
      //console.log(req.query)
      var tambahan = "where idtipe= '"+req.query.idtipe+"' and orde01='"+req.query.sudut_kepe+"' ";
      connection.query("SELECT asWkt(SHAPE) as geometry, namobj, idtipe, orde01 FROM mergesrline2_2020 "+tambahan, function(err, rows, fields) {
        if (err) throw err;
  
       //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");
  
      //res.end(JSON.stringify(rows))
  
        // MySQL query...
      //ambil geojson
        dbgeo.parse({
        "data": rows,
        "outputFormat": "topojson",
        "geometryColumn": "geometry",
        "geometryType": "wkt"
      },function(error, result) {
        if (error) {
          return console.log(error);
        }
        // This will log a valid GeoJSON object
       // console.log(result)  
        res.send(JSON.stringify(result))
      });
      });
  
      //connection.end();
      })

      router.get('/sr_point', function(req, res){
        //connection.connect();
        //console.log(req.query)
        var tambahan = "where idtipe= '"+req.query.idtipe+"' and orde02='"+req.query.sudut_kepe+"' ";
        console.log("SELECT asWkt(SHAPE) as geometry, namobj, idtipe, orde02 FROM mergesrpoint3_2020 "+tambahan)
        connection.query("SELECT asWkt(SHAPE) as geometry, namobj, idtipe, orde02 FROM mergesrpoint3_2020 "+tambahan, function(err, rows, fields) {
          if (err) throw err;
          
         //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");
    
        //res.end(JSON.stringify(rows))
    
          // MySQL query...
        //ambil geojson
          dbgeo.parse({
          "data": rows,
          "outputFormat": "topojson",
          "geometryColumn": "geometry",
          "geometryType": "wkt"
        },function(error, result) {
          if (error) {
            return console.log(error);
          }
          // This will log a valid GeoJSON object
         // console.log(result)  
          res.send(JSON.stringify(result))
        });
        });
    
        //connection.end();
        })


    router.get('/json_pupz', function(req, res){
      //connection.connect();
      //console.log(req.query)
      connection.query("SELECT terbatas, bersyarat,dilarang, ketentuan, keterangan, diizinkan from pupz where id_pola_ruang="+req.query.kode , function(err, rows, fields) {
      if (err) throw err;
        res.json(rows)
     
    });
  
      //connection.end();
      })
         router.get('/sistem_perkotaan_dan_perdesaan', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, ket, sistem, prioritas, perwujudan, zonasi, kecamatan FROM jaringan_perkotaan_dan_perdesaan "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
          router.get('/sistem_wilayah', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, swp, warna FROM sistemwilayahgeo2 "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
              router.get('/rencana_terminal', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, ket FROM rencanaterminalgeo "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
                        router.get('/bendung', function(req, res){
    //connection.connect();
    //console.log(req.query)
    if(req.query.id_kec){
      var tambahan = "where id_kec= '"+req.query.id_kec+"'";
    }else{
      var tambahan = "";
        
    }
    connection.query("SELECT asWkt(SHAPE) as geometry, perwujudan, zonasi, keterangan FROM bendung "+tambahan, function(err, rows, fields) {
      if (err) throw err;

     //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

    //res.end(JSON.stringify(rows))

      // MySQL query...
    //ambil geojson
      dbgeo.parse({
      "data": rows,
      "outputFormat": "topojson",
      "geometryColumn": "geometry",
      "geometryType": "wkt"
    },function(error, result) {
      if (error) {
        return console.log(error);
      }
      // This will log a valid GeoJSON object
     // console.log(result)  
      res.send(JSON.stringify(result))
    });
    });

    //connection.end();
    })
 // router.get('/bencana', function(req, res){
 // //connection.connect();
 // //console.log(req.query)
 // var tambahan = "where deleted=0";
 // if(req.query.id_kec){
 //    tambahan = tambahan+" and id_desa= '"+req.query.id_kec+"'";
 // }
 // connection.query("SELECT asWkt(a.SHAPE) as geometry, id  FROM angin_puting_beliung_dan_hujan_deras a "+tambahan, function(err, rows, fields) {
 //   if (err) throw err;

 //  //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

 // //res.end(JSON.stringify(rows))

 //   // MySQL query...
 // //ambil geojson
 //   dbgeo.parse({
 //   "data": rows,
 //   "outputFormat": "topojson",
 //   "geometryColumn": "geometry",
 //   "geometryType": "wkt"
 // },function(error, result) {
 //   if (error) {
 //     return console.log(error);
 //   }
 //   // This will log a valid GeoJSON object
 //  // console.log(result)  
 //   res.send(JSON.stringify(result))
 // });
 // });

 // //connection.end();
 // })


    router.get('/polaruang_kecamatan', function(req, res){
    //connection.connect();
   // console.log(req.query.kode_kab)
    var a = '';
    var data = [];
    var done = false;
       connection.query("SELECT  asWkt(SHAPE) as geometry, kecamatan FROM kecamatan a "+a , function(err, rows, fields) {
    if (err) throw err;
     data = rows;
      done = true;  
     
    });
        deasync.loopWhile(function(){return !done;});

    

     data.forEach(function(itemm, indexx){
      var done = false;
          a = "where ST_Intersects(a.SHAPE, GeomFromText('"+itemm.geometry+"')) ";
        
           connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode FROM pola_ruang a "+a , function(err, rows, fields) {
        if (err) throw err;
         data[indexx].pola_ruang = rows;
          done = true;  
         
        });
            deasync.loopWhile(function(){return !done;});

            data[indexx].pola_ruang.forEach(function(itemmx, indexxz){
               var done = false;
                 connection.query("SELECT distinct(a.jenis) as rencana_tg, a.kode, AsWkt(ST_Intersection(a.SHAPE, GeomFromText('"+itemm.geometry+"'))) as polygon FROM pola_ruang a "+a+" and a.kode="+itemmx.kode , function(err, rows, fields) {
                if (err) throw err;
                   data[indexxz].irisan = rows;
                   var total = 0;
                    rows.forEach(function(itemmm, indexxx){
                      if(itemmm.luas){
                      //  itemmm.luas.toFixed(4);
                      total = total + parseFloat(itemmm.luas);  
                      }
                      
                    })
                     data[indexx].pola_ruang[indexxz].total = total;
                done = true;  
               
              });
                 deasync.loopWhile(function(){return !done;});

             })
            data[indexx].geometry = '';
      })

   


       
      //  console.log(data)
          res.send(JSON.stringify(data))
    //connection.end();
    })


  
                   router.get('/bencana', function(req, res){
            //connection.connect();
           // console.log(req.query.kode_kab)
           var tambahan = "where deleted=0";
           if(req.query.id_desa){
              tambahan = tambahan+" and id_desa= '"+req.query.id_desa+"'";
           }
            if(req.query.id_bencana){
              tambahan = tambahan+" and id_bencana= '"+req.query.id_bencana+"'";
           }
           if(req.query.tahun){
              tambahan = tambahan+" and Year(tgl_kejadian)= '"+req.query.tahun+"'";
           }
            connection.query("SELECT *, DATE_FORMAT(tgl_kejadian, '%d-%m-%Y') as tgl_tampil FROM bencana a "+tambahan , function(err, rows, fields) {
              if (err) throw err;

              res.send(JSON.stringify(rows))
            });
            //connection.end();
            })

                 

                 router.get('/topojson_polaruang', function(req, res){
            //connection.connect();
           // console.log(req.query.kode_kab)
            var a = '';
         
            if(req.query.kode != undefined){
              a = "WHERE a.kode =  "+req.query.kode;
              a += " AND a.jnsrpr =  "+req.query.jenis;
            }
            connection.query("SELECT asWkb(a.SHAPE) as geometry, a.jenis as isi FROM polaruang_2020 a "+a , function(err, rows, fields) {
              if (err) throw err;

             //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");

            //res.end(JSON.stringify(rows))

              // MySQL query...
            //ambil geojson
              dbgeo.parse({
              "data": rows,
              "outputFormat": "topojson",
              "geometryColumn": "geometry",
              "geometryType": "wkb"
            },function(error, result) {
              if (error) {
                return console.log(error);
              }
              // This will log a valid GeoJSON object
             // console.log(result)  
              res.send(JSON.stringify(result))
            });
            });
            //connection.end();
            })

            router.get('/krb_lppb', function(req, res){
              //connection.connect();
             // console.log(req.query.kode_kab)
              var a = '';
           
              if(req.query.kode == 'lppb'){
                a = "WHERE a.kp2b IS NOT NULL ";
              
              }else{
                a = "WHERE a.krb IS NOT NULL ";
              }
              connection.query("SELECT asWkb(a.SHAPE) as geometry, a.jenis as isi, kode FROM polaruang_2020 a "+a , function(err, rows, fields) {
                if (err) throw err;
  
               //console.log("SELECT asWkt(admin_kec.the_geom) as geometry FROM admin_kec WHERE MBRContains(GeomFromText( 'POLYGON(("+req.query.kiri_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kanan_lat+","+req.query.kanan_lng+" "+req.query.kiri_lat+","+req.query.kiri_lng+" "+req.query.kiri_lat+"))' ),admin_kec.the_geom");
  
              //res.end(JSON.stringify(rows))
  
                // MySQL query...
              //ambil geojson
                dbgeo.parse({
                "data": rows,
                "outputFormat": "topojson",
                "geometryColumn": "geometry",
                "geometryType": "wkb"
              },function(error, result) {
                if (error) {
                  return console.log(error);
                }
                // This will log a valid GeoJSON object
               // console.log(result)  
                res.send(JSON.stringify(result))
              });
              });
              //connection.end();
              })

module.exports = router;
