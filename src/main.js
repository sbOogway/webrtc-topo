import './style.css';

const url = 'https://kv.valkeyrie.com/turtles/';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// HTML elements
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerInput = document.getElementById('answerInput');
const answerButton = document.getElementById('answerButton');
const acceptAnswerButton = document.getElementById('acceptAnswerButton');

const messageInput = document.getElementById('messageInput')
const messageButton = document.getElementById('messageButton')
const messageDiv = document.getElementById('messageDiv')


const kvSet = (key, value) => {
  fetch(url + key, {
    method: 'POST', // Specify the request method
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      k: value,
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      console.log(response)
      return response; // Parse the JSON response
    })
}

const kvGet = (key) => {
  fetch(url + key)
    .then(response => {
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok ' + response.statusText);
      }
      console.log(response)
      return response.text; // Parse the JSON response
    })
}

const kvDel = (key) => {
  fetch(url + key, {
    method: 'DELETE', // Specify the request method
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      console.log(response)
      return true; // Parse the JSON response
    })
}

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// const createWebRTCOffer = (localConnection, ) => {

const createWebRTCConnection = () => {
  const connection = new RTCPeerConnection(servers);

  connection.onicecandidate = e => {
    console.log("new ice candidate. i print my sdp")
    // need to put my sdp in signaling server
    console.log(JSON.stringify(connection.localDescription));
  }
  return connection;
}

// const createWebRTCDataChannel = (connection) => {
  
  // return dataChannel;
// }

const createWebRTCOffer = (connection) => {
  connection.createOffer().then(o => connection.setLocalDescription(o))
}

const acceptWebRTCOffer = (connection, offer) => {
  connection.ondatachannel = e => {
    const channel = e.channel;
    channel.onmessage = e => {
      console.log("messsage received!!!" + e.data);
      messageDiv.innerHTML += `${e.data}`;
    }
    channel.onopen = e => {console.log("open!!!!"); channel.send("yo g wassup")}
    channel.onclose = e => console.log("closed!!!!!!");
    connection.channel = channel;
  }

  connection.setRemoteDescription(offer).then(a => console.log("offer accepted"))
}

const createWebRTCAnswer = async (connection) => {
  await connection.createAnswer()
    .then(a => connection.setLocalDescription(a))
    .then(a => console.log(JSON.stringify(connection.localDescription)))
}

const acceptWebRTCAnswer = (connection, answer) => {
  connection.setRemoteDescription(answer).then(a => console.log("answer accepted"))
}

const key = makeid(10);

kvSet(key, "allgoodg");
setTimeout(() => {
  kvGet(key);
  // kvDel(key);
  // kvGet(key);
}, 2000);

const connection = createWebRTCConnection();
const dataChannel = connection.createDataChannel("data");
dataChannel.onmessage = e => console.log("message received " + e.data)
dataChannel.onopen = e => console.log("data channel opened")
dataChannel.onclose = e => console.log("data channel closed")
// var dataChannel;
// 2. Create an offer
callButton.onclick = async () => {
  // const connection = createWebRTCConnection();
  
  createWebRTCOffer(connection);
};

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  const offer = JSON.parse(callInput.value);
  // console.log(offer)
  // const connection = createWebRTCConnection();
  acceptWebRTCOffer(connection, offer);
  createWebRTCAnswer(connection);
};

acceptAnswerButton.onclick = async () => {
  const answer = JSON.parse(answerInput.value);
  acceptWebRTCAnswer(connection, answer);
}

messageButton.onclick = async () => {
  console.log('dbg btn clck')
  const message = messageInput.value;
  // dataChannel.send(message);
  dataChannel.send(message);
}