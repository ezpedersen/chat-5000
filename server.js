var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server); 
var port = /**process.env.PORT || **/ 5000;
app.set('port', port);
app.use(express.static('client'));
server.listen(port, function() {
  console.log('Starting server on port '+port);
});
var totaltext="";
var personList = [];
var admin;
io.on('connection', function(socket) {
    io.emit('updatedata',personList);
    socket.on('new person',function(name){
        var person = new Object();
        person.id = socket.id;
        person.name = name;
        person.impostername = "";
        person.rank = "";
        if(totaltext==""){
            person.rank = "admin";
            admin = person.name;
            console.log(admin);
            totaltext="<span style='color:darkred; font-weight: bold;'>[ADMIN] "+name+"</span>" + " joined the chat";
        }
        else{
            totaltext+="<br>"+name+" joined the chat.";
        }
        personList.push(person);
        io.emit('message',totaltext);
        io.emit('updatedata',personList);
    });
    socket.on('disconnected',function(name){
        totaltext+="<br>"+name+" left the chat.";
        personList.forEach(function(i){
            if(i.name===name){
                personList.splice(personList.indexOf(i));     
            } 
        });
        io.emit('message',totaltext);
        io.emit('updatedata',personList);
    });
    socket.on('message', function(data,name,rank) {
        if(rank==="admin"){
            totaltext+="<br><span style='color:darkred; font-weight: bold;'>[ADMIN] "+name+"</span>: "+data;
        }
        else if(rank=="vip"){
            totaltext+="<br><span style='color:lime; font-weight: bold;'>|VIP| "+name+"</span>: "+data;
        }
        else if(rank=="spit"){
            totaltext+="<br><span style='color:brown; text-decoration: underline'>(spit on me) "+name+"</span>: "+data;
        }
        else if(rank=="coolkid"){
            totaltext+="<br><span style='color:DarkTurquoise; font-weight: bold;'>{Cool Kid} "+name+"</span>: "+data;
        }
        else{
            totaltext+="<br>"+name+": "+data;
        }
        io.emit('message',totaltext);
    });
    socket.on('ban',function(name,data){
        if(name==admin&&data!==admin){
            io.emit("requestban",data);
        }; 
    });
    socket.on('promote',function(name,data){
        if(name==admin&&data!==admin){
            personList.forEach(function(i){
                if(i.name===data){
                    if(i.rank==""){
                        i.rank="vip";
                        totaltext+="<br>"+data+" has been promoted to <span style='color:lime; font-weight: bold;'>|VIP|!</span>";
                        io.emit('message',totaltext);
                    }
                    else if(i.rank==="vip"){
                        i.rank="coolkid";
                        totaltext+="<br>"+data+" has been promoted to <span style='color:DarkTurquoise; font-weight: bold;'>{Cool Kid}!</span>";
                        io.emit('message',totaltext);
                    }
                    else if(i.rank==="spit"){
                        i.rank="";
                        totaltext+="<br>"+data+" has been promoted to a regular guy";
                        io.emit('message',totaltext);
                    }
                }
            });
        }
        io.emit('updatedata',personList);
    });
    socket.on('demote',function(name,data){
        if(name==admin&&data!==admin){
            personList.forEach(function(i){
                if(i.name===data){
                    if(i.rank===""){
                        i.rank="spit";
                        totaltext+="<br>"+data+" has been demoted to <span style='color:brown; text-decoration: underline'>(spit on me)</span>";
                        io.emit('message',totaltext);
                    }
                    else if(i.rank==="coolkid"){
                        i.rank="vip";
                        totaltext+="<br>"+data+" has been demoted to <span style='color:lime; font-weight: bold;'>|VIP|</span>";
                        io.emit('message',totaltext);
                    }
                    else if(i.rank==="vip"){
                        i.rank="";
                        totaltext+="<br>"+data+" has been demoted to a regular guy";
                        io.emit('message',totaltext);
                    }
                }
            });
        }
        io.emit('updatedata',personList);
    });
    socket.on('impose',function(name,data){
        if(name==admin){
            var nameExists = false;
            personList.forEach(function(i){
                if(i.name==data){
                    nameExists = true;   
                };
            });
            personList.forEach(function(i){
                if(i.name===name){
                    if(nameExists=== true){
                        if(i.impostername!==""){
                            io.emit('repossess',i.impostername);
                        }
                        if(name===data){
                            i.impostername="";
                        }
                        else{
                            io.emit('requestimposter',data);   
                            i.impostername=data; 
                        }
                    }
                    io.emit('updatedata',personList);
                }
            });   
        }; 
    });
    socket.on("banned", function(name){
        personList.forEach(function(i){
            if(i.name===name){
                personList.splice(personList.indexOf(i));     
            } 
        });
        totaltext+="<br>"+name+" has been removed from the chat.";
        io.emit('message',totaltext);
        io.emit('updatedata',personList);
    });
});
setInterval(function(){io.emit('updatedata',personList);},100);
