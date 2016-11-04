
/*
 * GET home page.
 */

var fs = require('fs')
module.exports = function(app){
	//接口首页
	app.get('/',function(req,res){
		  var fileName = req.params.filename,
		  	  jsonName = './public/jsonFile/packagejson.json';			
		  // fs.writeFileSync(jsonName,JSON.stringify({}));
		  var read = new Promise(function(resolve,reject){
		  		resolve(fs.readFileSync(jsonName))
		  }); 	
		  read.then(function(response){
		  	response = JSON.parse(response);
		  	if(response.dataList){
		  		res.render('index', { haveList: true, list:response.dataList})
		  	}else{
		  		res.render('index', { haveList: false, list:[]})
		  	}
		  }).catch(function(response){
		  	res.render('index', { haveList: false, list:[]})
		  })  
	})
	//获取一个数据文件
	app.get('/getjson/:filename',function(req,res){
	  //文件名称
	  var fileName = req.params.filename,
	  	  jsonName = './public/jsonFile/'+fileName+'.json';			
	  // fs.writeFileSync(jsonName,JSON.stringify({a:1,b:2}));
	  var read = new Promise(function(resolve,reject){
	  		resolve(fs.readFileSync(jsonName))
	  }); 		
	  read.then(function(response){
	  	res.json(JSON.parse(response))
	  }).catch(function(response){
	  	res.render('noresult')
	  })  
	})
	//创建接口页面
	app.get('/create',function(req,res){
		res.render('create',{isEdit:false})
	})	
	//存储json
	app.post('/save',function(req,res){
		//文件名称
	  var fileName = req.body.name,
	  	  jsonString = req.body.data,	
	  	  jsonName = './public/jsonFile/'+fileName+'.json';		  
	  var read = new Promise(function(resolve,reject){
	  		resolve(fs.writeFileSync(jsonName,jsonString))
	  }); 		
	  read.then(function(response){
	  	res.json({a:'ok'})
	  }).catch(function(response){
	  	res.render('noresult')
	  })  
	})
	//编辑接口页面
	app.get('/edit',function(req,res){
		res.render('create',{isEdit:true,stringValueJson:'{"a":1}'})
	})	
}