$(function () {
    var username =  prompt('请输入昵称');
    $('.name').html(username);
    var input = $('.inputMessage');
    var socket = io();
    function scrollToBottom () {
        $('#chat-area').scrollTop($('#chat-area')[0].scrollHeight);
    }
    socket.on('connect', function () {
        var name = $('.name').text() ||'匿名';
        socket.emit('join',name);
    });
    socket.on('sys', function (msg) {
        $('.messages').append('<p>'+msg+'</p>');
        scrollToBottom();
    });

    input.on('keydown',function (e) {
        if (e.which === 13) {
            var message = $(this).val();
            if (!message) {
                return ;
            }
            socket.send(message);
            $(this).val('');
        }
    });

    socket.on('new message', function (msg,user) {
        $('.messages').append('<p>'+user+'说：'+msg+'</p>');
        scrollToBottom();
    });


    
});