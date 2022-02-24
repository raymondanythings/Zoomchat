"use strict";

var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));

require("../css/index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var socket = io();
var myFace = document.getElementById("myFace");
var muteBtn = document.getElementById("mute");
var cameraBtn = document.getElementById("camera");
var camerasSelect = document.getElementById("cameras");
var chatBox = document.getElementById("chat");
var chatting = document.getElementById("chatting");
var call = document.getElementById("call");
var myStream;
var muted = false;
var cameraOff = false;
var roomName;
var myPeerConnection;
var myDataChannel;
call.hidden = true;
chatting.style.visibility = "hidden";

function getCameras() {
  return _getCameras.apply(this, arguments);
}

function _getCameras() {
  _getCameras = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee3() {
    var devices, cameras, currentCamera;
    return _regeneratorRuntime["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return navigator.mediaDevices.enumerateDevices();

          case 3:
            devices = _context3.sent;
            cameras = devices.filter(function (device) {
              return device.kind === "videoinput";
            });
            currentCamera = myStream.getVideoTracks()[0];
            cameras.forEach(function (camera) {
              var option = document.createElement("option");
              option.value = camera.deviceId;
              option.innerText = camera.label;

              if (currentCamera.label === camera.label) {
                option.selected = true;
              }

              camerasSelect.appendChild(option);
            });
            _context3.next = 12;
            break;

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](0);
            console.log(_context3.t0);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 9]]);
  }));
  return _getCameras.apply(this, arguments);
}

function getMedia(_x) {
  return _getMedia.apply(this, arguments);
}

function _getMedia() {
  _getMedia = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee4(deviceId) {
    var initialConstraints, cameraConstraints;
    return _regeneratorRuntime["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            initialConstraints = {
              audio: true,
              video: {
                facingMode: "user"
              }
            };
            cameraConstraints = {
              audio: true,
              video: {
                deviceId: {
                  exact: deviceId
                }
              }
            };
            _context4.prev = 2;
            _context4.next = 5;
            return navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);

          case 5:
            myStream = _context4.sent;
            myFace.srcObject = myStream;

            if (deviceId) {
              _context4.next = 10;
              break;
            }

            _context4.next = 10;
            return getCameras();

          case 10:
            _context4.next = 15;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](2);
            console.log(_context4.t0);

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 12]]);
  }));
  return _getMedia.apply(this, arguments);
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach(function (track) {
    return track.enabled = !track.enabled;
  });
  muteBtn.innerText = muted ? "Unmute" : "Mute";
  muted = !muted;
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach(function (track) {
    return track.enabled = !track.enabled;
  });
  cameraBtn.innerText = cameraOff ? "Turn Camera On" : "Turn Camera Off";
  cameraOff = !cameraOff;
}

function handleCameraChange() {
  return _handleCameraChange.apply(this, arguments);
}

function _handleCameraChange() {
  _handleCameraChange = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee5() {
    var videoTrack, videoSender;
    return _regeneratorRuntime["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return getMedia(camerasSelect.value);

          case 2:
            if (myPeerConnection) {
              videoTrack = myStream.getVideoTracks()[0];
              videoSender = myPeerConnection.getSenders().find(function (sender) {
                return sender.track.kind === "video";
              });
              videoSender.replaceTrack(videoTrack);
            }

          case 3:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _handleCameraChange.apply(this, arguments);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange); // Welcome Form ( Join a Room )

var welcome = document.getElementById("welcome");
var welcomeForm = welcome.querySelector("form");
var h3 = welcome.querySelector("h3");
h3.hidden = true;
socket.on("room_change", function (rooms) {
  if (rooms.length !== 0) {
    h3.hidden = false;
  }

  var roomList = welcome.querySelector("ul");
  roomList.innerText = "";
  rooms.forEach(function (room) {
    var li = document.createElement("li");
    li.innerText = room;
    li.addEventListener("click", handleLiClick);
    roomList.appendChild(li);
  });
});

function initCall() {
  return _initCall.apply(this, arguments);
}

function _initCall() {
  _initCall = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee6() {
    return _regeneratorRuntime["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            welcome.hidden = true;
            call.hidden = false;
            _context6.next = 4;
            return getMedia();

          case 4:
            makeConnection();

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _initCall.apply(this, arguments);
}

function joinRoom(input) {
  var title = document.querySelector("main h1");
  socket.emit("join_room", input);
  roomName = input;
  title.innerText = "ROOM: ".concat(roomName);
  document.title = "".concat(roomName, " | Noom");
  input.value = "";
}

function handleWelcomeSubmit(_x2) {
  return _handleWelcomeSubmit.apply(this, arguments);
}

function _handleWelcomeSubmit() {
  _handleWelcomeSubmit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee7(e) {
    var input;
    return _regeneratorRuntime["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            e.preventDefault();
            input = welcomeForm.querySelector("input");
            _context7.next = 4;
            return initCall();

          case 4:
            joinRoom(input.value);
            input.value = "";

          case 6:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _handleWelcomeSubmit.apply(this, arguments);
}

function handleLiClick(_x3) {
  return _handleLiClick.apply(this, arguments);
}

function _handleLiClick() {
  _handleLiClick = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee8(e) {
    var input;
    return _regeneratorRuntime["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            input = e.target.innerText;
            _context8.next = 3;
            return initCall();

          case 3:
            joinRoom(input);

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _handleLiClick.apply(this, arguments);
}

var chatForm = call.querySelector("form");
chatForm.addEventListener("submit", handleChatSubmit);

function handleChatSubmit(e) {
  e.preventDefault();
  var input = chatForm.querySelector("input");
  var message = input.value;
  var myMessage = document.createElement("li");
  myMessage.className = "myMessage";
  myMessage.innerText = message;
  chatBox.appendChild(myMessage);
  myDataChannel.send(message);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

function makeMessage(event) {
  var message = document.createElement("li");
  message.className = "opMessage";
  message.innerText = event.data;
  chatBox.appendChild(message);
} // Socket Code


socket.on("welcome", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee() {
  var offer;
  return _regeneratorRuntime["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          chatting.style.visibility = "";
          myDataChannel = myPeerConnection.createDataChannel("chat");
          myDataChannel.addEventListener("message", makeMessage);
          console.log("made data channel");
          _context.next = 6;
          return myPeerConnection.createOffer();

        case 6:
          offer = _context.sent;
          myPeerConnection.setLocalDescription(offer);
          console.log("Send the offer");
          socket.emit("offer", offer, roomName);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
socket.on("offer", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee2(offer) {
    var answer;
    return _regeneratorRuntime["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            chatting.style.visibility = "";
            myPeerConnection.addEventListener("datachannel", function (event) {
              myDataChannel = event.channel;
              myDataChannel.addEventListener("message", makeMessage);
            });
            console.log("received the offer");
            myPeerConnection.setRemoteDescription(offer);
            _context2.next = 6;
            return myPeerConnection.createAnswer();

          case 6:
            answer = _context2.sent;
            myPeerConnection.setLocalDescription(answer);
            socket.emit("answer", answer, roomName);
            console.log("Sent the answer");

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4) {
    return _ref2.apply(this, arguments);
  };
}());
socket.on("answer", function (answer) {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});
socket.on("ice", function (ice) {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
}); // RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [{
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302"]
    }]
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleAddStream);
  myStream.getTracks().forEach(function (track) {
    return myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  console.log("Send cadidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  var peersStream = document.getElementById("peerFace");
  peersStream.srcObject = data.streams[0];
}