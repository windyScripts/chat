
const logOutButton = document.querySelector('#logout');
logOutButton.addEventListener('click', logOutUser);

async function logOutUser(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  console.log('token removed!');
  window.location.href = '../login/login.html';
}

const incomingMessageTemplate = document.createElement('div');
incomingMessageTemplate.className = 'message';

const chatBubble = document.createElement('div');
chatBubble.className = 'chat-bubble incoming';

const messageContent = document.createElement('p');
messageContent.appendChild(document.createTextNode('message here'));

chatBubble.appendChild(messageContent);
chatBubble.appendChild(document.createElement('div')).className = 'fill';

incomingMessageTemplate.appendChild(chatBubble);
