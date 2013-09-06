(function(window,angular,$,wom){
	var _wom = window._wom = angular.module("wom",[]),
		security = wom.security;
		routers = [
			{
				name: "weibo",
				text: "首页",
				links: [
					{icon:"ico_myhomepage",text:"首页",selected:false,main:[{url:'/weibo/status'}]},
					{icon:"ico_message",text:"消息",selected:false,main:[{url:'/service/disposeWeiBo'}],sub:[
						{icon: "ico_lev_at",text:"提到我的",selected:false,main:[{url:"/service/disposeWeiBo"}]},
						{icon: "ico_lev_comment",text:"评论",selected:false,main:[{url:"/service/disposeComment"}]}
					]},
					{icon:"ico_favor",text:"收藏",selected:false,main:[{url:'/weibo/status/favor'}]},
					{icon:"my_ico yuqing",text:"舆情",selected:false,mian:[{url:'/service/disposeSentiment'}],sub:[
						{text:"舆情列表",selected:false,main:[{url:"/service/disposeSentiment"}]},
						{text:"舆情设置",selected:false,main:[{url:"/service/sentimentInstall"}]}
					]}
				],
				udSLine: [
					{icon:"ico_group",text:"重点关注",selected:false,main:[{url:'/weibo/status/friends?type=1'}]},
					{icon:"ico_group",text:"已发微博",selected:false,main:[{url:'/weibo/status/user',
						ctrl:function($scope,$http,Pager){
						
						$scope.data = null;
						$scope.pager = Pager(20);
						$scope.url = "/weibo/status/getUserTimeline.json";
						$scope.context = {
							features : [
							    {feature:0,text:"全部"},
								{feature:1,text:"原创"},
								{feature:2,text:"图片"},
								{feature:3,text:"视频"},
								{feature:4,text:"音乐"}
							],	
							feature : 0
						};
						$scope.go = function(page){
							$scope.pager.page = page;
							$http.get($scope.url + "?" + $.param(angular.extend($scope.context,$scope.pager)))
							.success(function(response){
								$scope.data = response.data.data;
								$scope.pager.total = response.data.total;
							});
						};
						$scope.go(1);
						
					}}]}
				]
			},
			{
				name: "sys",
				text: "首页",
				links: [
					{icon:"ico_sendtome",text:"个人资料",selected:false,main:[{url:'/user/myHome'}],sub:[
					 {text:"基本资料",selected:false,main:[{url:"/user/myHome"}]},
					 {text:"修改密码",selected:false,main:[{url:"/user/setPwd"}]}
					]},
					{icon:"my_ico team-mana",text:"企业管理",selected:false,main:[{url:'/admin/user'}],sub:[
						{text:"用户管理",selected:false,main:[
						{url:"/admin/user",ctrl:function($scope,$http,Pager,$rootScope){
							
//							<#if data.passive??&&data.passive=='false'>
//							$(".totaltip").fadeIn(1000);
//							</#if>
							
							$scope.oldcontext = {
								userName: "KeyWord",
								email: "KeyWord",
								teamName: "KeyWord",
								staff: "null",
								superUser: "null",
								active: "null",
								orderact: "createDate DESC"
							};
							$scope.context = angular.extend({},$scope.oldcontext);
							$scope.data = {};
							$scope.pager = Pager(5);
							$scope.order = function(str){
								$scope.context.orderact == str + " DESC"?
								$scope.context.orderact = str + " ASC":
								$scope.context.orderact = str + " DESC";
								$scope.goE();
							};
							
							$scope.totaltip = null;
							
//							$(".addbtn").parent().click(function(){location.href=url + "/add";});

							//搜索
							$(".search_val").keydown(function(event){
								if(event.keyCode==13) $scope.goE();
							});
							
							$(".maintable_title td").each(function(){
								var t = $(this).text();
								if(t!="操作")
								$(this).attr("title","点击按"+ t.trim() +"排序");
							});
							
							$scope.del = function(id){

								if(!confirm("您确定要删除用户"+$("#"+id).find("td label").eq(0).text()+"么？"))return;
								$.get("/admin/user" + "/delUser",{
									id:id,
									teamId:(security.superUser&&$rootScope.team)?
											$("#"+id).attr("tid"):$rootScope.team
								}).done(function(){
									alert("已删除");
									$scope.go($scope.pager.page);
								});
									
							};
							
//							$scope.edit = function(){
//								$(this).parent().css("cursor","pointer").click(function(){
//									location.href = url + "/getDetail?id="+$(this).parents("tr:first").attr("id");
//								});
//							};
							
							$scope.go = function(page){
								
								$scope.pager.page = page || 1;
								$http.get("/admin/user/showUsers.json" + "?" +
									$.param(angular.extend($scope.oldcontext,$scope.pager)))
									.success(function(response){
										$scope.data = response.data.data;
										$scope.pager.total = response.data.total;
									});
								
								$scope.totaltip = $scope.pager.total==0?"有"+$scope.pager.total+"个用户符合条件":"没有符合条件的用户";
//								$("#users_search form").find("[name='passive']").val("true").end().submit();
							};
							
							$scope.goE = function(){
								angular.extend($scope.oldcontext,$scope.context);
								$scope.go();
							};
							
							$scope.goE();
							
						}},
						{url:"/admin/user/add",ctrl:function($scope,$http,$rootScope){
							
							$("form#userInfo").validationEngine("attach",{
								submitHandler:submit,
								promptPosition:"centerRight",
								scrollOffset:200
							});
							
							$scope.user={
								active:true,	
								staff:true,	
								superUser:false
							};
							
							function submit(){
								var url = "/admin/user/addUserExecute.json";
								console.log($scope.user);
								$http.get(url+"?"+$.param($scope.user)).success(function(response){
									alert(response.data.message);
									history.back();
								});
								return true;
							};
						}},{url:"/admin/user/getDetail",ctrl:function($routeParam){
							alert($routeParam.id);
						}}
						]},
						{text:"企业管理",selected:false,main:[{url:"/admin/team"}]},
						{text:"角色管理",selected:false,main:[{url:"/admin/role"}]},
						{text:"微博管理",selected:false,main:[{url:"/admin/provider"}]},
						{text:"小秘书管理",selected:false,main:[{url:"/admin/helper"}]}
					]}
				]
			}
			
		],
		defualtCtrl = function($scope,$route,$location){
		};
		
	_wom.controller("menu",function($scope,$rootScope){
		$rootScope.$on("$routeChangeStart",function(event,next,current){
			if(current){
				current.$$route.main.selected = false;
				if(current.$$route.main.sub)
					current.$$route.main.sub.forEach(function(v,i){
						v.selected = false;
					});
			}
			$scope.router = next.$$route.root;
			next.$$route.main.selected = true;
			next.$$route.sub ? next.$$route.sub.selected = true : null;
			
			$rootScope.user = wom.common.config.userId;
			$rootScope.team = wom.common.config.teamId;
		});
	});
	
	_wom.config(['$routeProvider','$locationProvider','$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {
		
		$httpProvider.responseInterceptors.push(function(){
			return function(promise){
				return promise.then(function(response){
					if(angular.isString(response.data)&&
						response.data.indexOf("<meta wom-login") > -1)
						location.href="/account/login.html";
					return response;
				},function(response){
					return response;
				});
			};
		});
		
		$locationProvider.html5Mode(true).hashPrefix('!');
		
	    $routeProvider.otherwise({
	    
	    redirectTo: 
	    
		    $.each(routers,function(k,root){
		    	var fun = function(k,v){
			    	if(v.sub)
		  				v.sub.forEach(function(sv,i){
		  					sv.main.forEach(function(main){
		  						when(main,root,v,sv);
		  					});
		  				});
		  			else{
		  				v.main.forEach(function(main){
		  					when(main,root,v);
		  				});
		  			}
		    	};
		    	
		    	root.links ? $.each(root.links,fun) : null;
		    	root.udSLine ? $.each(root.udSLine,fun) : null;
		    		
			})[0].links[0].url
	    
	    });
	    
	    function when(main,root,v,sub){
	    	$routeProvider.when(main.url, {templateUrl: main.url, root:root, main:v, sub:sub, controller: main.ctrl || defualtCtrl});
	    }
	    
//	    window.location.href += window.location.pathname;
	    
	}]);
	
	_wom.factory("Pager",function(){
		
		//scope,每页多少,显示几个页
		function Pager(count,pagecount){
			
			this.page = 0;
			this.total = 0;
			this.count = count || 20;
			this.pagecount = pagecount || 10;
			
		};
		
		Pager.prototype.__defineGetter__("totalpage",function(){
			return this.total%this.count==0?this.total/this.count:
				this.total/this.count-this.total%this.count/this.count+1;
		});
		
		Pager.prototype.__defineGetter__("pages",function(){
			var pn = this.page,
				pagecount = this.pagecount,
				p = this.totalpage,
				pages = [];
			
			if(p<=10){
			   	for(var i=1;i<=p;i++)
					pages.push(i);
			}else{
			   	if(pn<=pagecount/2)
			    	for(var i=1;i<=pagecount;i++)
			    		pages.push(i);
		       	else{
		       		var end=pn>p-pagecount/2?p:pn+pagecount/2;
		       		for(var i=pn-pagecount/2-1;i<=end;i++){
		       			pages.push(i);
		       		};
		       	};
		    };
		    
		    return pages;
		});
		
		return function page(count,pagecount){
			return new Pager(count, pagecount);
		};
		
	});
	
	_wom.filter('judge', function() {
		return function(input,j) {
			//return input ? '\u2713' : '\u2718';
			var trueStr = /^true/g;
			var falseStr = /^(null|undefined|false)/g;
			if(falseStr.test(input)){
				return j.split(":")[1];
			}else{
				return j.split(":")[0];
			}
		};
	});
	
	_wom.filter('red', function() {
		return function(input,reg){
			return input&&reg?input.replace(new RegExp("("+reg+")","i"),"<font color='red'>$1</font>"):input;
		};
	});
	
//	_wom.directive('ngClickClass', function() {
//		//格式: ["要改变的对象:获取数据方法(可以没有,默认为go)","class:要给对象赋的值"...]
//		//例: ["context.orderact:go","_asc:userName ASC","_desc:userName DESC"]
//		return {
//			link: function(scope, element, attrs, controller){
//				var d = eval(attrs.ngClickClass),
//					va = d.shift();
//				
//				function apply(a){
//					a = a.split(":");
//					scope.$eval(va + "='" + a[1] + "'");
//					scope.$apply();
//					element.addClass(a[0]);
//					scope[va.split(":")[1]||"go"]();
//				}
//				
//				element.unbind("click").click(function(){
//					var no = true;
//					$.each(d,function(i,v){
//						var cv = v.split(":");
//						element.siblings().removeClass(cv[0]);
//						if(scope.$eval(va) == cv[1]){
//							element.removeClass(cv[0]);
//							apply((d[i+1]?d[i+1]:d[0]));
//							no = false;
//						};
//					});
//					if(no) apply(d[d.length-1]);
//				});
//			}
//		};
//	});
	
	_wom.directive('defualt', function() {
		return {
			link:function link(scope, element, attrs, controller) { 
				element.unbind("blur").blur(function(){
					if(scope.$eval(attrs.ngModel)=='')
						scope.$eval(attrs.ngModel+"='"+attrs.defualt+"'");
					scope.$apply();
				}).unbind("focus").focus(function(){
					if(scope.$eval(attrs.ngModel)==attrs.defualt)
						scope.$eval(attrs.ngModel+"=''");
					scope.$apply();
				});
			}
		};
	});	
	
	wom.find = function(o,call){
		var r = null;
		o && $.each(o,function(k,v){
			if(call.call(v,k)) {
				r = v;
				return false;
			}
		});
		return r;
	};
})(window,angular,jQuery,wom);