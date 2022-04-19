const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

app.set("view engine", "ejs").set("views", path.join(__dirname + "/views"));

app.use(express.static("public"));

io.on("connection", (socket) => {
	console.log("user connected");
	socket.on("message", (msg) => {
		socket.emit("message", msg);
	});
});

server.listen(port, () => {
	console.log("listening to port:" + port);
});

app.get("/", (req, res) => {
	res.render("index");
});
