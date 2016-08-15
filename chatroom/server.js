var express  =  require('express');
var path = require('path');
var http=require('http');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var PORT = 8080;
app.locals.title='多人聊天室';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//socket.io start
var server = http.Server(app);
var io = require('socket.io').listen(server);
var roomUser = {};

io.on('connection',function(socket){
    var url = socket.request.headers.referer;
    var split_arr = url.split('/');
    var roomid = split_arr[split_arr.length-1];
    var user = '';

    socket.on('join',function(username){
        user = username;
        // 将用户归类到房间
        if(!roomUser[roomid]){
            roomUser[roomid] = [];
        }
        roomUser[roomid].push(user);
        socket.join(roomid);
        socket.to(roomid).emit('sys',user+'加入了房间');
        socket.emit('sys',user+'加入了房间');
    });

    // 监听来自客户端的消息
    socket.on('message',function(msg){
         // 验证如果用户不在房间内则不给发送
        if(roomUser[roomid].indexOf(user)<0){
            return false;
        }
        socket.to(roomid).emit('new message',msg,user);
        socket.emit('new message',msg,user);
    });

    // 关闭
    socket.on('disconnect',function(){
        // 从房间名单中移除
        socket.leave(roomid,function(err){
            if(err){
                log.error(err);
            }else{
                var index  = roomUser[roomid].indexOf(user);
                if(index !== -1){
                    roomUser[roomid].splice(index,1);
                    socket.to(roomid).emit('sys',user+'退出了房间');
                }
            }
        });
        
    });
});

//socket.io end

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

if(!module.parent){
    server.listen(PORT);
    console.log('chatroom started up on port:'+ PORT);
}

module.exports = server;
