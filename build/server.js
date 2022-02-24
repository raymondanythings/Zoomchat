"use strict";

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var PORT = process.env.PORT || 3000;
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src" + "/views");
app.use("/public", _express["default"]["static"](__dirname + "/public"));
app.use("/static", _express["default"]["static"]("assets"));
app.get("/", function (_, res) {
  return res.render("home");
});
app.get("/*", function (_, res) {
  return res.redirect("/");
});

var httpServer = _http["default"].createServer(app);

var wsServer = (0, _socket["default"])(httpServer);

function publicRooms() {
  var _wsServer$sockets$ada = wsServer.sockets.adapter,
      sids = _wsServer$sockets$ada.sids,
      rooms = _wsServer$sockets$ada.rooms;
  var publicRooms = [];
  rooms.forEach(function (_, key) {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", function (socket) {
  wsServer.sockets.emit("room_change", publicRooms());
  socket.on("join_room", function (roomName) {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("offer", function (offer, roomName) {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", function (answer, roomName) {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", function (ice, roomName) {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("disconnect", function () {
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

var handleListen = function handleListen() {
  return console.log("Listening on http://localhost:3000");
};

httpServer.listen(PORT, handleListen);