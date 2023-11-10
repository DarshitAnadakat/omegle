// Add these variables at the top of your script.js file
let ws; // WebSocket variable for text chat
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');
let localStream;
let peerConnection;
let userId = getStoredUserId() || generateUserId(); // Retrieve user ID from cookies or generate a new one
let sessionId = generateSessionId(); // Generate a new session ID
let sessionUsers = []; // Users in the current session

// Function to generate a unique user ID
function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}


// Function to generate a new session ID
function generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9);
}

// Function to create a new session
function createNewSession() {
    sessionUsers = []; // Clear users in the current session
    userId = userId || generateUserId(); // Assign a unique user ID if not already assigned
    storeUserIdInCookie(userId); // Store user ID in cookies
    sessionUsers.push(userId); // Add the current user to the session
    console.log('New session created. User ID:', userId);
     // Notify the server about the new session and user ID
     ws.send(JSON.stringify({ type: 'new-session', sessionId, userId }));
}


// Function to retrieve user ID from cookies
function getStoredUserId() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
            return value;
        }
    }
    return null;
}


// Function to store user ID in cookies
function storeUserIdInCookie(userId) {
    document.cookie = `userId=${userId}; expires=Thu, 18 Dec 2030 12:00:00 UTC; path=/`;
}





// Function to randomly match two users in the session
function matchUsersInSession() {
    if (sessionUsers.length === 2) {
        const user1 = sessionUsers[0];
        const user2 = sessionUsers[1];
        console.log('Matched users:', user1, 'and', user2);

        // Update the UI with matched users in the chat frame
        updateMatchedUsers(user1, user2);

        // Implement logic to notify users about the match and initiate communication
        initiateWebRTCConnection(user1, user2);
    }
}


// Add these lines to your script.js
function updateMatchedUsers(user1, user2) {
    const matchedUsersInfoElement = document.getElementById('matchedUsersInfo');
    matchedUsersInfoElement.innerHTML = `<p>Matched Users: ${user1} and ${user2}</p>`;
    // You can customize this to enhance the UI as needed
}






// Function to update UI with matched users
function updateMatchedUsers(user1, user2) {
    const matchedUsersElement = document.getElementById('matchedUsers');
    matchedUsersElement.textContent = `Matched Users: ${user1} and ${user2}`;
    // You can customize this to enhance the UI as needed
}

// Function to initiate WebRTC connection
function initiateWebRTCConnection(user1, user2) {
    const isInitiator = user1 === userId; // Check if the current user is the initiator
    const initiatorId = isInitiator ? user1 : user2;
    const peerId = isInitiator ? user2 : user1;

    // Placeholder for signaling logic
    // You need to implement how you exchange SDP and ICE candidates with the other peer
    // This might involve using a WebSocket or another method

    // Placeholder for handling signaling data
    handleSignalingData();

    // Create an offer to start the WebRTC connection
    if (isInitiator) {
    createOffer();
}
}

// Placeholder for handling signaling data
function handleSignalingData() {
    // You need to implement how to handle signaling data from the other peer
    // This might involve sending/receiving data through a WebSocket or another method
}

// Placeholder for creating an offer
async function createOffer() {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        // Placeholder for sending the offer to the other peer using your signaling server
        sendOffer(offer);
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Placeholder for sending the offer to the other peer using your signaling server
function sendOffer(offer) {
    // You need to implement how to send the offer to the other peer
    // This might involve using a WebSocket or another method
}

// WebRTC functions

async function initLocalStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = stream;
        localStream = stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

function initWebRTC() {
    createNewSession(); // Create a new session when the page loads

    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Initialize WebSocket for text chat
    initiateTextChat();

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the candidate to the other peer using your signaling server
            sendIceCandidate(event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Your signaling logic goes here
    // You need to implement how you exchange SDP and ICE candidates with the other peer

    // Example for handling incoming signaling data (you need to customize this)
    handleSignalingData();

    // Create an offer to start the WebRTC connection
    createOffer();
}

function initiateTextChat() {
    // Replace 'your-text-chat-url' with the actual URL of your WebSocket server for text chat
    ws = new WebSocket('your-text-chat-url');

    ws.addEventListener('open', (event) => {
        console.log('Text chat WebSocket connection opened');
        // Send the user ID to the server
        ws.send(JSON.stringify({ type: 'user-id', userId }));
    });

    ws.addEventListener('message', (event) => {
        // Handle incoming text messages from the other peer
        const data = JSON.parse(event.data);
        if (data.type === 'text-message') {
            displayMessage(data.sender + ': ' + data.message);
        }
    });

    ws.addEventListener('error', (error) => {
        console.error('Text chat WebSocket error:', error);
    });

    ws.addEventListener('close', (event) => {
        console.log('Text chat WebSocket connection closed');
    });
}

function sendTextMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'text-message', message, sender: 'You', userId }));
    }
}

function sendMessageToOtherPeer() {
    const message = messageInput.value.trim();
    if (message !== '') {
        displayMessage('You: ' + message);
        // Send the message to the other peer using your signaling server
        sendTextMessage(message);
        messageInput.value = '';
    }
}

function createNewSession() {
    sessionUsers = []; // Clear users in the current session
    userId = getStoredUserId() || generateUserId(); // Retrieve user ID from cookies or generate a new one
    sessionId = generateSessionId(); // Generate a new session ID
    storeUserIdInCookie(userId); // Store user ID in cookies
    sessionUsers.push(userId); // Add the current user to the session
    console.log('New session created. User ID:', userId, 'Session ID:', sessionId);
}

// Initialize WebSocket for signaling
function initSignalingWebSocket() {
    // Replace 'your-signaling-server-url' with the actual URL of your WebSocket server for signaling
    ws = new WebSocket('ws://localhost:3000');

    ws.addEventListener('open', (event) => {
        console.log('Signaling WebSocket connection opened');
        createNewSession(); // Create a new session when the page loads
    });

    ws.addEventListener('message', (event) => {
        handleSignalingData(event.data);
    });

    ws.addEventListener('error', (error) => {
        console.error('Signaling WebSocket error:', error);
    });

    ws.addEventListener('close', (event) => {
        console.log('Signaling WebSocket connection closed');
    });
}

// Function to handle incoming signaling data
function handleSignalingData(data) {
    const parsedData = JSON.parse(data);

    switch (parsedData.type) {
        case 'new-session':
            handleNewSession(parsedData);
            break;
        case 'offer':
            handleOffer(parsedData);
            break;
        case 'answer':
            handleAnswer(parsedData);
            break;
        case 'ice-candidate':
            handleIceCandidate(parsedData);
            break;
        // Add more cases as needed
    }
}
// Function to handle new session data
function handleNewSession(data) {
    const { sessionId: newSessionId, users } = data;

    // Update session ID and users
    sessionId = newSessionId;
    sessionUsers = users;

    // Match users if there are two users in the session
    matchUsersInSession();
}

// Text chat functions

sendMessageButton.addEventListener('click', sendMessageToOtherPeer);

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
}

// Function to handle offer data
function handleOffer(data) {
    const { from: offerer, offer } = data;

}

// Function to handle answer data
function handleAnswer(data) {
    const { from: answerer, answer } = data;
}


// Function to handle ice candidate data
function handleIceCandidate(data) {
    const { from: candidateSender, candidate } = data;}
// Call these functions when the page loads

initLocalStream();
initWebRTC();
initSignalingWebSocket();
