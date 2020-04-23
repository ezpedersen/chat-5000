var personList = [];
var socket = io();
var impostername="";
var rank = "";
document.addEventListener('keydown', (event) => {
	if(!event.repeat&&event.key=="Enter") {
		send();
	}
});
socket.on('message', function(data) {
	document.getElementById("chat").innerHTML=data;
	document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
});
socket.on('updatedata',function(data){
	personList=data;
	personList.forEach(function(i){
	   if(i.id==socket.id){
		   name=i.name;
		   impostername=i.impostername;
		   rank = i.rank;
	   } 
	});
});
function send(){
	var msg = document.getElementById("input").value;
	if(msg!==""){
		if(msg.charAt(0)=="/"){
			if(msg.substr(1,4)=='ban:'){
				socket.emit('ban',name,msg.substr(5,msg.length-1));
			}
			if(msg.substr(1,7)=='impose:'){
				socket.emit('impose',name,msg.substr(8,msg.length-1));
			}
			if(msg.substr(1,8)=='promote:'){
				socket.emit('promote',name,msg.substr(9,msg.length-1));
			}
			if(msg.substr(1,7)=='demote:'){
				socket.emit('demote',name,msg.substr(8,msg.length-1));
			}
			document.getElementById("input").value = ""; 
		}
		else if(impostername!==""){
			var imposterRank="";
			personList.forEach(function(i){
			   if(i.name==impostername){
				   imposterRank=i.rank;
			   } 
			});
			socket.emit('message',msg,impostername,imposterRank);
			document.getElementById("input").value = "";     
		}
		else{
			socket.emit('message',msg,name,rank);
			document.getElementById("input").value = "";     
		} 
	}
}
var name;
setTimeout(function(){name = prompt("What's your name?");allowaccess();},200);
function allowaccess(){
	if(name===null||name.trim()==""||name==="null"){
		name = prompt("You have to choose a name");
		allowaccess();
	}  
	else if(name!==null&&name!==""){
		var isnameinvalid = false;
		personList.forEach(function(i){
			if(i.name===name){
				name = prompt("That name is already taken");
				isnameinvalid=true;
				allowaccess();
			} 
		});
		if(name.length>10){
			name = prompt("That name is too long");
			isnameinvalid=true;
			allowaccess();
		}
		for(var i = 0; i <name.length;i++){
			console.log(name[i]);
			if(name[i]==":"){
				name = prompt("You can't have : in your name");
				isnameinvalid=true;
				allowaccess();
			}
		}
		if(isnameinvalid===false){
			socket.emit('new person',name);
		}
	}
};
window.addEventListener("beforeunload",function(e){
	if(name){
		socket.emit("disconnected",name);    
	}
});
socket.on("requestban",function(data){
   if(name==data){
	   document.getElementById("server").style.display="none";
	   document.getElementById("banned").style.display="block";
	   document.getElementById("hijacked").style.display="none";
	   socket.emit("banned",name);  
	   socket.disconnect(); 
   } 
});
socket.on("requestimposter",function(data){
   if(name==data){
	   document.getElementById("server").style.display="none";
	   document.getElementById("banned").style.display="none";
	   document.getElementById("hijacked").style.display="block";
	   document.body.style.pointerEvents="none";
   } 
});
socket.on("repossess",function(data){
	if(name==data){
		document.getElementById("server").style.display="block";
		document.getElementById("banned").style.display="none";
		document.body.style.pointerEvents="all";
		document.getElementById("hijacked").style.display="none";
	}
});