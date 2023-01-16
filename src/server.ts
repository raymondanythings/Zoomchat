import * as http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src" + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.use("/static", express.static("assets"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms: string[] = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
wsServer.on("connection", (socket) => {
  wsServer.sockets.emit("room_change", publicRooms());
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

console.log("OK");

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(PORT, handleListen);
