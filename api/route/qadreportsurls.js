var db=require('../config/mssql_database.js');

var publicFields = 'dirname leafname';

exports.list=function(req,res) {
    db.sql.connect(db.config,function(err){
	//...error checks

	var request = new db.sql.Request();
	request.query("select distinct dirname as name,leafname as value from dbo.Docs where dirname = 'QAD Reports' and leafname not in('Data Source','Forms')",
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
exports.listAll=function(req,res) {
    var subitem=req.params.name || '';

    if(subitem===''){
	return res.send(400);
    }

    var tmpsql='';
    if(subitem!=='All'){
	tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
	tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
	tmpsql=tmpsql+" where a.dirname = 'QAD Reports/"+subitem+"'";
    }else{
	tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
	tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
	tmpsql=tmpsql+" where a.dirname like 'QAD Reports/%'";
    }
    
    console.log(tmpsql);

    db.sql.connect(db.config,function(err){
	//...error checks

	var request = new db.sql.Request();
	request.query(tmpsql,
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
