const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

app.set("view engine", "ejs").set("views", path.join(__dirname + "/views"));

app.use(express.static("public")).use(express.urlencoded());

server.listen(port, () => {
	console.log("listening to port: " + port);
});

app.get("/", (req, res) => {
	res.render("index");
});

app.post("/create-room", (req, res) => {
	console.log(req.body);
	res.redirect(`/${req.body.roomId}`);
});

app.post("/join-room", (req, res) => {
	console.log(req.body);
	res.redirect(`/${req.body.room}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	console.log("user connected");
	socket.on("join-room", (roomId, userId) => {
		socket.join(roomId);
		socket.to(roomId).emit("user-connected", userId);

		socket.on("disconnect", () => {
			socket.to(roomId).emit("user-disconnected", userId);
		});
	});
	socket.on("chat-message", (roomId, msg) => {
		io.to(roomId).emit("chat-message", msg);
	});
});
