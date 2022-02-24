import regeneratorRuntime from "regenerator-runtime";
import "../css/index.css";

const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const chatBox = document.getElementById("chat");

const chatting = document.getElementById("chatting");
const call = document.getElementById("call");

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

call.hidden = true;
chatting.style.visibility = "hidden";

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (err) {
    console.log(err);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (err) {
    console.log(err);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  muteBtn.innerText = muted ? "Unmute" : "Mute";
  muted = !muted;
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  cameraBtn.innerText = cameraOff ? "Turn Camera On" : "Turn Camera Off";
  cameraOff = !cameraOff;
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form ( Join a Room )

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(e) {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  const title = document.querySelector("main h1");
  socket.emit("join_room", input.value);
  roomName = input.value;
  title.innerText = `ROOM: ${roomName}`;
  document.title = `${roomName} | Noom`;
  input.value = "";
}
const chatForm = call.querySelector("form");
chatForm.addEventListener("submit", handleChatSubmit);
function handleChatSubmit(e) {
  e.preventDefault();
  const input = chatForm.querySelector("input");
  const message = input.value;
  const myMessage = document.createElement("li");
  myMessage.className = "myMessage";
  myMessage.innerText = message;
  chatBox.appendChild(myMessage);
  myDataChannel.send(message);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

function makeMessage(event) {
  const message = document.createElement("li");
  message.className = "opMessage";
  message.innerText = event.data;
  chatBox.appendChild(message);
}

// Socket Code

socket.on("welcome", async () => {
  chatting.style.visibility = "";
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", makeMessage);
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("Send the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  chatting.style.visibility = "";
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", makeMessage);
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("Sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("Send cadidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peersStream = document.getElementById("peerFace");
  peersStream.srcObject = data.streams[0];
}
