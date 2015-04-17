var db=require('../config/mssql_database.js');

var publicFields = 'dirname leafname';

exports.list=function(req,res) {
    db.sql.connect(db.config,function(err){
	//...error checks

	var request = new db.sql.Request();
	request.query("select dirname as name,leafname as value from dbo.Docs where dirname = 'QAD Reports' and leafname<>'Data Source'",
		      function(err,recordset){
			  //console.dir(recordset);
			  if (err) {
			      console.log(err);
			      db.sql.close();
			      return res.send(400);
			  };
			  db.sql.close();
			  res.json(200,recordset);
		      });
	
    });
    //request

    //end

};