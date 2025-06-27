// DOM Elements
const navIcons = document.querySelectorAll('.navigation i');
const HOME = document.getElementById('HOME');
const MESSEGE = document.getElementById('MESSEGE');
const SETTINGS = document.getElementById('SETTINGS');
const PROFILE = document.getElementById('PROFILE');
const btn_loader = document.getElementById('btn_loader');
const buttondis = document.getElementById('disconnect');
const textINPUT = document.getElementById('textINPUT');
const messegeBODY = document.getElementById('messegeBODY');

// State Variables
buttondis.style.display = 'none';
let btn_loader_toggle = false;
let partnerId = null;
let typingTimeout = null;
let typingIndicatorVisible = false;

// Socket.io Connection
const socket = io();

// ========== CONNECTION FUNCTIONS ==========
function handleConnection() {
  if (!btn_loader_toggle) {
    connectToChat();
  } else {
    disconnectFromChat();
  }
}

function connectToChat() {
  btn_loader.style.backgroundColor = '#10b981';
  btn_loader_toggle = true;
  document.querySelector('.button_loader').style.animation = 'mymove 1s ease infinite';
  btn_loader.textContent = 'STOP';
  socket.connect();
  socket.emit('find_match');
}

function disconnectFromChat() {
  btn_loader.style.backgroundColor = 'black';
  btn_loader_toggle = false;
  document.querySelector('.button_loader').style.animation = 'none';
  btn_loader.textContent = 'CONNECT';
  socket.disconnect();
}

function handleDisconnect() {
  let res = confirm("Sure You would Leave ?")
  if(res){
    socket.disconnect();
    resetAll();
  }else{
    return;
  }
}

// ========== NAVIGATION FUNCTIONS ==========
function handleNavigation(icon) {
  if (icon.classList.contains('disabled')) return;
  
  navIcons.forEach(i => {
    if (!i.classList.contains('disabled')) {
      i.classList.remove('active');
    }
  });
  
  icon.classList.add('active');
  const action = icon.getAttribute('data-action');
  
  switch(action) {
    case 'home':
      showSection(HOME);
      break;
    case 'profile':
      showSection(PROFILE);
      break;
    case 'setting':
      showSection(SETTINGS);
      break;
    default:
      showSection(MESSEGE);
  }
  
  document.querySelector('.button_loader').style.animation = 'none';
}

function showSection(section) {
  HOME.style.display = 'none';
  MESSEGE.style.display = 'none';
  SETTINGS.style.display = 'none';
  PROFILE.style.display = 'none';
  section.style.display = 'block';
}

// ========== MESSAGE FUNCTIONS ==========
function handleKeyDown(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}
const typingSound = new Audio('/typing1.mp3');
typingSound.loop = true; 
typingSound.preload = 'auto';
function handleTyping() {
  if (!partnerId) return;

  socket.emit('typing', { to: partnerId });
  // typingSound.currentTime = 0;

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { to: partnerId });
    typingSound.pause();
  },2000);
}

function sendMessage() {
  const msg = textINPUT.value.trim();
  if (!msg || !partnerId) return;
  
  socket.emit('chat_message', { to: partnerId, message: msg });
  addMessage('sent', msg);
  textINPUT.value = '';
  socket.emit('stop_typing', { to: partnerId });
}

function addMessage(type, msg) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `messege ${type}`;
  msgDiv.textContent = msg;
  messegeBODY.appendChild(msgDiv);
  messegeBODY.scrollTop = messegeBODY.scrollHeight;
}

// ========== TYPING INDICATORS ==========
function showPartnerTyping() {
  if (typingIndicatorVisible) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message received typing-indicator';
  msgDiv.innerHTML = `
    <div class="typing-content">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  messegeBODY.appendChild(msgDiv);
  messegeBODY.scrollTop = messegeBODY.scrollHeight;
  typingIndicatorVisible = true;
  typingSound.play();
}

function hidePartnerTyping() {
  const indicators = messegeBODY.querySelectorAll('.typing-indicator');
  indicators.forEach(indicator => {
    messegeBODY.removeChild(indicator);
  });
  typingIndicatorVisible = false;
  typingSound.pause();
}

// ========== EVENT HANDLERS ==========
function handleMatched({ partner }) {
  partnerId = partner;
  showSection(MESSEGE);
  navIcons[1].classList.remove('disabled');
  navIcons[0].classList.remove('active');
  navIcons[1].classList.add('active');
  buttondis.style.display = 'block';
  document.querySelector('[data-action="messege"]').classList.add('active');
  
  const status = document.getElementById('status');
  if (status) status.innerText = `Matched with ${partnerId}`;
}

function handleIncomingMessage({ from, message }) {
  hidePartnerTyping();
  addMessage('received', message);
}

function handlePartnerDisconnect() {
  alert("Disconnected... soul feels empty 😭");
  resetAll();
}

// ========== SYSTEM FUNCTIONS ==========
function resetAll() {
  buttondis.style.display = 'none';
  btn_loader.style.backgroundColor = 'black';
  btn_loader.textContent = 'CONNECT';
  btn_loader_toggle = false;
  navIcons[1].classList.add('disabled');
  navIcons[0].classList.add('active');
  navIcons[1].classList.remove('active');
  document.querySelector('.button_loader').style.animation = 'none';
  partnerId = null;
  messegeBODY.innerHTML = '';
  typingIndicatorVisible = false;
  showSection(HOME);
  
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}

// ========== INITIALIZATION ==========

function setupEventListeners() {
  // Button Events
  btn_loader.addEventListener('click', handleConnection);
  buttondis.addEventListener('click', handleDisconnect);

  // Navigation Events
  navIcons.forEach(icon => {
    icon.addEventListener('click', () => handleNavigation(icon));
  });

  // Message Input Events
  textINPUT.addEventListener('keydown', handleKeyDown);
  textINPUT.addEventListener('input', handleTyping);

  // Socket.io Events
  socket.on('matched', handleMatched);
  socket.on('chat_message', handleIncomingMessage);
  socket.on('partner_disconnected', handlePartnerDisconnect);
  socket.on('typing_status', showPartnerTyping);
  socket.on('stop_typing_status', hidePartnerTyping);
}

function init() {
  setupEventListeners();
  showSection(HOME);
}

// Prevent gesture events
['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
  document.addEventListener(evt, e => e.preventDefault());
});

const sendli = document.getElementById('sendli');

sendli.addEventListener('click', ()=>{
  sendMessage();
})
// Start the application
init();