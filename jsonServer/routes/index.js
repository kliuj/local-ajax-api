
/*
 * GET home page.
 */

var fs = require('fs')

function saveName(name,url){
	//存储文件名和url到ajaxapilist文件
	var jsonName = './public/jsonfile/ajaxapilist.json',
			read = new Promise(function(resolve,reject){
					resolve(fs.readFileSync(jsonName))
			});

	var _write = new Promise(function(resolve,reject){
			read.then(function(response){
				var list  = JSON.parse(response).dataList,
						new_arr = [{"name":name,"url":url}];
				//合并json
				if(list){
					for(var i = 0;i<list.length;i++){
						//比较url，url不能重复
						if(url != list[i].url){
							new_arr.push(list[i])
							continue ;
						}
					}
				}
				resolve(fs.writeFileSync(jsonName,JSON.stringify({"warn":"存放所有的关系表，建议不要手动修改","dataList":new_arr})))
			}).catch(function(response){
				resolve(fs.writeFileSync(jsonName,JSON.stringify({"warn":"存放所有的关系表，建议不要手动修改","dataList":[{"name":name,"url":url}]})))
			})
	})
	_write.then(function(){

	}).catch(function(){

	})
}
module.exports = function(app){
	//接口首页
	app.get('/',function(req,res){
		  var jsonName = './public/jsonfile/ajaxapilist.json';
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
	app.get('/getjson/:jsonUrl',function(req,res){
	  //文件名称
	  var jsonUrl = req.params.jsonUrl,
	  	  jsonName = './public/jsonfile/'+jsonUrl+'.json';
	  var read = new Promise(function(resolve,reject){
	  		resolve(fs.readFileSync(jsonName))
	  });
	  read.then(function(response){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
			res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	  	res.json(JSON.parse(response).detail)
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
		//文件名称 是url 英文。便于调用 ；fileName只是描述内容
	  var fileName = req.body.name.replace(/\s/g,""),
	  	  jsonUrl = req.body.url.replace(/\s/g,""),
	  	  jsonString = req.body.data,
	  	  jsonName = './public/jsonfile/'+jsonUrl+'.json';
	  if(fileName && jsonUrl){
	  	var read = new Promise(function(resolve,reject){
		  		resolve(fs.writeFileSync(jsonName,jsonString))
		  });
			//把新的关系表保存到ajaxapilist
			saveName(fileName,jsonUrl)
		  read.then(function(response){
		  	res.json({success:true,message:"保存成功"})
		  }).catch(function(response){
		  	res.json({success:false,message:response})
		  })
	  }else{
			//后台加一道拦截，防止没有文件名和url
	  	res.json({success:false,message:"名称或url不能为空"})
	  }

	})
	//编辑接口页面
	app.get('/edit/:jsonUrl',function(req,res){
			//文件名称其实就是url最后的参数
		  var jsonUrl = req.params.jsonUrl,
		  	  jsonName = './public/jsonfile/'+jsonUrl+'.json';
		  if(!jsonUrl){
		  	res.redirect('/')
		  }else{
		  	  var read = new Promise(function(resolve,reject){
			  		resolve(fs.readFileSync(jsonName))
			  });
			  read.then(function(response){
			  	res.render('create',{isEdit:true,stringValueJson:JSON.parse(response)})
			  }).catch(function(response){
			  	res.render('noresult')
			  })
		  }
	})
	//搜索接口
	app.get('/search/:keyword',function(req,res){
		var keyword = req.params.keyword.replace(/\s/g,""),
				jsonName = './public/jsonfile/ajaxapilist.json';
		var read = new Promise(function(resolve,reject){
				resolve(fs.readFileSync(jsonName))
		});
		read.then(function(response){
			response = JSON.parse(response);
			if(response.dataList){
				var list = response.dataList,
						new_arr = [];
				for(var i = 0;i<list.length;i++){
					if(list[i].name.match(keyword) || list[i].url.match(keyword)){
						new_arr.push(list[i])
					}
				}
				if(new_arr.length){
					res.render('index', { haveList: true, list:new_arr})
				}else {
					res.render('index', { haveList: false, list:[]})
				}
			}else{
				res.render('index', { haveList: false, list:[]})
			}
		}).catch(function(response){
			res.render('index', { haveList: false, list:[]})
		})
	})
	//判断是否重复
	app.get('/repeat',function(req,res){
		var apiurl = req.query.apiurl.replace(/\s/g,""),
				jsonName = './public/jsonfile/ajaxapilist.json',
				read = new Promise(function(resolve,reject){
						resolve(fs.readFileSync(jsonName))
				});
		read.then(function(response){
			response = JSON.parse(response);
			if(response.dataList){
				var list = response.dataList;
				for(var i = 0;i<list.length;i++){
					if(list[i].url  == apiurl){
							res.json({ repeat: true,success:true});
							return
					}
				}
				res.json({ repeat: false,success:true})
			}else{
				res.json({ repeat: false,success:true})
			}
		}).catch(function(response){
			res.json({ repeat: false,success:true})
		})
	})
}
