var db=require('../config/mssql_database.js');
var dbredis=require('../config/redis_database.js');

var publicFields = 'dirname leafname';

exports.list=function(req,res) {
    var redisClient=dbredis.redisClient;
    redisClient.get("qadreport",function(err,reply){
	if (err) {
	    console.log(err);
	}
	//console.log("hasvalue:"+reply);	    
	if (reply) {
	    //console.log(JSON.parse(reply));
	    console.log("listAll get from redis.");
	    res.json(200,JSON.parse(reply));
	}else{
	    //log
	   // console.log("Null:"+reply);
	    //getfrom db
	    console.log("listAll get from db.");
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
				  redisClient.set("qadreport",JSON.stringify(recordset));
				  res.json(200,recordset);
			      });
	
	    });//end db
	    //end else
	}
	//end if
    });
    //request

    //end

};
exports.listAll=function(req,res) {
    var subitem=req.params.name || '';

    if(subitem===''){
	return res.send(400);
    }
    var getRedisName="QadReport"+subitem;

    var redisClient=dbredis.redisClient;
    redisClient.get(getRedisName,function(err,reply){
	if (err) {
	    console.log(err);
	}
	//console.log("hasvalue:"+reply);	    
	if (reply) {
	    //console.log(JSON.parse(reply));
	    console.log("listAll get from redis:"+getRedisName);
	    res.json(200,JSON.parse(reply));
	}else{
	    //log
	   // console.log("Null:"+reply);
	    //getfrom db
    	    console.log("listAll get from db:"+getRedisName);
	    var tmpsql='';
	    if(subitem!=='All'){
		tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
		tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
		tmpsql=tmpsql+" where a.dirname = 'QAD Reports/"+subitem+"' and a.Extension='rdl'";
	    }else{
		tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
		tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
		tmpsql=tmpsql+" where a.dirname like 'QAD Reports/%' and a.Extension='rdl'";
	    }

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
				  redisClient.set(getRedisName,JSON.stringify(recordset));
				  res.json(200,recordset);
			      });
	
	    });//end db
	    //end else
	}
	//end if
    });
    //request

    //end

};
exports.listAllfromDB=function(req,res) {
    var subitem=req.params.name || '';

    if(subitem===''){
	return res.send(400);
    }
    
    
    var tmpsql='';
    if(subitem!=='All'){
	tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
	tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
	tmpsql=tmpsql+" where a.dirname = 'QAD Reports/"+subitem+"' and a.Extension='rdl'";
    }else{
	tmpsql="select distinct a.dirname as name,a.leafname as value,isnull(b.tp_ColumnSet.value('nvarchar7[1]','nvarchar(100)'),'') as rdesc from dbo.Docs a "
	tmpsql=tmpsql+" left join dbo.UserData b on (a.listid=b.tp_ListId and a.DoclibRowId=b.tp_id) "
	tmpsql=tmpsql+" where a.dirname like 'QAD Reports/%' and a.Extension='rdl'";
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
