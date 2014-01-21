// 2013, Muaz Khan - https://github.com/muaz-khan
// MIT License     - https://www.webrtc-experiment.com/licence/
// Documentation   - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(8079);

// ----------------------------------socket.io

var channels = {};

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected)
        io.isConnected = true;

    socket.on('new-channel', function (data) {
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
        if (!isChannelPresent)
            initiatorChannel = channel;
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel)
            channels[initiatorChannel] = null;
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
        });
    });
}

// ----------------------------------extras

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/video-conferencing/index.html');
});

app.get('/conference.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/video-conferencing/conference.js');
});

app.get('/conference-ui.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/video-conferencing/conference-ui.js');
});

app.get('/chat', function (req, res) {
    res.sendfile(__dirname + '/static/text-chat.html');
});

app.get('/RTCMultiConnection', function (req, res) {
    res.sendfile(__dirname + '/static/RTCMultiConnection/index.html');
});

app.get('/socketio.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/socket.io.js');
});







/*
var app = require('http').createServer().listen(2013);
var io = require('socket.io').listen(app);

io.set('log level', 1); // reduce logging

io.sockets.on('connection', function(socket) {
console.log('connected');
       socket.on('message', function(message) {
console.log(message);
       socket.broadcast.emit('message', message);
   });
});
*/




// var SIGNALING_SERVER = 'http://domain.com:8888/';
// connection.openSignalingChannel = function(config) {   
//    var channel = config.channel || this.channel || 'one-to-one-video-chat';
//    var sender = Math.round(Math.random() * 60535) + 5000;

//    io.connect(SIGNALING_SERVER).emit('new-channel', {
//       channel: channel,
//       sender : sender
//    });

//    var socket = io.connect(SIGNALING_SERVER + channel);
//    socket.channel = channel;

//    socket.on('connect', function () {
//       if (config.callback) config.callback(socket);
//    });

//    socket.send = function (message) {
//         socket.emit('message', {
//             sender: sender,
//             data  : message
//         });
//     };

//    socket.on('message', config.onmessage);
// };
