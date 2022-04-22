console.log("appje werkt");

const socket = io();
const header = document.querySelector("h1");
const roomId = document.querySelector(".roomId").innerText;
const sendBtn = document.querySelector(".sendbutton");
const chatInput = document.querySelector(".chat-input");
const chat = document.querySelector(".chat");
const videoGrid = document.querySelector(".video-grid");
const peer = new Peer();
// const peer = new Peer();
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

let localStream, remoteStream;

(async () => {
	if (navigator.mediaDevices) {
		localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		addStream(myVideo, localStream);
	}
})();

peer.on("open", (id) => {
	socket.emit("join-room", roomId, id);
});

sendBtn.addEventListener("click", (e) => {
	e.preventDefault();
	console.log("send message");
	const msg = chatInput.value;
	socket.emit("chat-message", roomId, msg);
});

socket.on("user-connected", (userId) => {
	connectToNewUser(userId);
});

socket.on("user-disconnected", (userId) => {
	peers[userId].close();
});

peer.on("call", (call) => {
	console.log(`you're getting called`);
	call.answer(localStream);
	console.log("call answered");
	const video = document.createElement("video");
	call.on("stream", (stream) => {
		addStream(video, stream);
	});
});

socket.on("chat-message", (msg) => {
	const message = document.createElement("li");
	message.innerText = msg;
	chat.appendChild(message);
});

function addStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videoGrid.append(video);
}
function connectToNewUser(userId) {
	const call = peer.call(userId, localStream);
	const video = document.createElement("video");
	call.on("stream", (stream) => {
		console.log("stream received", stream);
		addStream(video, stream);
	});
	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
}
