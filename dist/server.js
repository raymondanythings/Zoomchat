"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var http = __importStar(require("http"));
var socket_io_1 = require("socket.io");
var express_1 = __importDefault(require("express"));
var app = (0, express_1["default"])();
var PORT = process.env.PORT || 3000;
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src" + "/views");
app.use("/public", express_1["default"].static(__dirname + "/public"));
app.use("/static", express_1["default"].static("assets"));
app.get("/", function (_, res) { return res.render("home"); });
app.get("/*", function (_, res) { return res.redirect("/"); });
var httpServer = http.createServer(app);
var wsServer = new socket_io_1.Server(httpServer);
function publicRooms() {
    var _a = wsServer.sockets.adapter, sids = _a.sids, rooms = _a.rooms;
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
console.log("OK");
var handleListen = function () { return console.log("Listening on http://localhost:3000"); };
httpServer.listen(PORT, handleListen);
//# sourceMappingURL=server.js.map