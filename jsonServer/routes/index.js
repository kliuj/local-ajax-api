
/*
 * routers
 */

var fs = require('fs')
//保存到关系表
/*
*{
	name:'显示名称',
	url:'实际的接口url'
	multi:'是否是多层级url'
}
*/
function saveName(obj){
	//存储文件名和url到ajaxapilist文件
	var jsonName = './public/jsonfile/ajaxapilist.json',
			read = new Promise(function(resolve,reject){
					resolve(fs.readFileSync(jsonName))
			});

	var _write = new Promise(function(resolve,reject){
			read.then(function(response){
				var list  = JSON.parse(response).dataList,
						new_arr =obj.del ? [] : [{"name":obj.name,"url":obj.url,multi:obj.multi || false}];//如果是删除则不需要这个新的数据
				//合并json
				if(list){
					for(var i = 0;i<list.length;i++){
						//比较url，url不能重复
						if(obj.url != list[i].url){
							new_arr.push(list[i])
							continue ;
						}
					}
				}
				resolve(fs.writeFileSync(jsonName,JSON.stringify({"warn":"存放所有的关系表，建议不要手动修改","dataList":new_arr})))
			}).catch(function(response){
				console.log('reset')
				resolve(fs.writeFileSync(jsonName,JSON.stringify({"warn":"存放所有的关系表，建议不要手动修改","dataList":[{"name":obj.name,"url":obj.url}]})))
			})
	})
	_write.then(function(){

	}).catch(function(){

	})
}
//处理多级url
function urlToName(url){
	//multi 代表多级url
		var multi = false
		if(/\//.test(url)){
			multi = true
		}
		return {
			fileName: url.replace(/\//g,"."),
			url: url,
			multi: multi
		}
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
	//获取一个数据文件 (处理多级url)
	app.get('/getjson/*',function(req,res){
	  //文件名称
	  var jsonUrl = urlToName(req.params[0]),
	  	  jsonName = './public/jsonfile/'+jsonUrl.fileName+'.json';
	  	  console.log(jsonUrl)
	  var read = new Promise(function(resolve,reject){
	  		resolve(fs.readFileSync(jsonName))
	  });
	  read.then(function(response){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
			res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	  	res.json(JSON.parse(JSON.parse(response).detail))
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
	  var urlName = req.body.name.replace(/\s/g,""),
	  	  jsonUrl = urlToName(req.body.url.replace(/\s/g,"")),
	  	  jsonString = req.body.data,
	  	  jsonName = './public/jsonfile/'+jsonUrl.fileName+'.json';
	  if(urlName && jsonUrl){
	  	var read = new Promise(function(resolve,reject){
		  		resolve(fs.writeFileSync(jsonName,jsonString))
		  });
			//把新的关系表保存到ajaxapilist
			saveName({name:urlName,url:jsonUrl.url,multi:jsonUrl.multi})
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
	app.get('/edit/*',function(req,res){
			//文件名称其实就是url最后的参数
	     var jsonUrl = urlToName(req.params[0]),
  	  		 jsonName = './public/jsonfile/'+jsonUrl.fileName+'.json';
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
	//删除接口
	app.post("/delete",function(req,res){
		var jsonUrl = urlToName(req.body.url.replace(/\s/g,"")),
				jsonName = './public/jsonfile/'+jsonUrl.fileName+'.json',
				del = new Promise(function(resolve,reject){
					resolve(fs.unlinkSync(jsonName))
				});
		// saveName({name:jsonName,url:jsonUrl.url,del:true})
		saveName({name:jsonName,url:jsonUrl.url,multi:jsonUrl.multi,del:true})
		del.then(function(response){
			console.log('ok')
			res.json({ code: 0,success:true})
		}).catch(function(e){
			console.log(e)
			res.json({ code: 1,success:false,info:e})
		})
	})
	//多级url
	// app.get('/getjson/*',function(req,res){
	//   //文件名称

	//   var jsonUrl = rreq.params[0];
	//   // if(jsonUrl.)
	//   var jsonName = './public/jsonfile/'+jsonUrl+'.json';
	//   	  console.log(jsonUrl)
	//   var read = new Promise(function(resolve,reject){
	//   		resolve(fs.readFileSync(jsonName))
	//   });
	//   read.then(function(response){
	// 		res.header("Access-Control-Allow-Origin", "*");
	// 		res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	// 		res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	//   	res.json(JSON.parse(JSON.parse(response).detail))
	//   }).catch(function(response){
	//   	res.render('noresult')
	//   })
	// })
}
