 module.exports.connection = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : 'sawunggaling26a',
    database : '2020_rtrw_pekalongan'
  }
});


// ogr2ogr -f "MySQL" MYSQL:"2020_pinda,host=128.199.196.228,user=root,password=sawunggaling26a,port=3306" -lco engine=MYISAM C:/Users/user/Downloads/temporary/Pekalongan_polaruang/polaruang.shp -skipfailures