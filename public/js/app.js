console.log("appje werkt");

const socket = io();
const header = document.querySelector("h1");
const roomId = document.querySelector(".roomId").innerText;
const sendBtn = document.querySelector(".sendbutton");
const chatInput = document.querySelector(".chat-input");
const chat = document.querySelector(".chat");
const videoGrid = document.querySelector(".video-grid");
const muteBtn = document.querySelector(".toggleMic");
const camBtn = document.querySelector(".toggleCam");
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

// ========= //
// EventListeneres
// ========= //

muteBtn.addEventListener("click", (e) => {
	e.preventDefault();
	toggleMic();
	if (localStream.getAudioTracks()[0].enabled === true) {
		socket.emit("mic-enabled");
	} else {
		socket.emit("mic-disabled");
	}
	console.log("you are muted");
});

camBtn.addEventListener("click", (e) => {
	e.preventDefault();
	toggleCam();
	if (localStream.getVideoTracks()[0].enabled === true) {
		socket.emit("cam-enabled");
	} else {
		socket.emit("cam-disabled");
	}
	console.log("cam enabled/disabled");
});

sendBtn.addEventListener("click", (e) => {
	e.preventDefault();
	console.log("send message");
	const msg = chatInput.value;
	socket.emit("chat-message", roomId, msg);
});

// ========= //
// Peer connection handling
// ========= //

peer.on("open", (id) => {
	console.log(id);
	socket.emit("join-room", roomId, id);
});

peer.on("call", (call) => {
	call.answer(localStream);
	const video = document.createElement("video");
	call.on("stream", (stream) => {
		addStream(video, stream);
	});
	call.on("close", () => {
		video.remove();
	});
	peers[call.peer] = call;
});

// ========= //
// Socket handling
// ========= //

socket.on("user-connected", (userId) => {
	connectToNewUser(userId);
});

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) {
		peers[userId].close();
		delete peers[userId];
	} else {
		console.log("user not found");
		console.log(peers);
	}
});

socket.on("chat-message", (msg) => {
	const message = document.createElement("li");
	message.innerText = msg;
	chat.appendChild(message);
});

// ========= //
// Functions
// ========= //
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
		addStream(video, stream);
	});
	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
}

function toggleMic() {
	localStream.getAudioTracks()[0].enabled =
		!localStream.getAudioTracks()[0].enabled;
}

function toggleCam(stream) {
	localStream.getVideoTracks()[0].enabled =
		!localStream.getVideoTracks()[0].enabled;
}
