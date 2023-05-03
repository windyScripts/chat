
const domain = 'http://localhost:3000';
const logOutButton = document.querySelector('#logout');
logOutButton.addEventListener('click', logOutUser);

async function logOutUser(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  console.log('token removed!');
  window.location.href = '../login/login.html';
}

const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token;
  } catch (err) {
    console.log(err);
  }
};

const inputButton = document.querySelector('#inputButton');
const addMessage = async e => {
  e.preventDefault();
  const inputMessageField = document.querySelector('#input');
  const message = inputMessageField.value;
  const token = getToken();
  await axios.post(domain + '/message', { message }, { headers: { Authorization: token }});
  inputMessageField.value = '';
  await refreshMessages();
};
inputButton.addEventListener('click', addMessage);

const renderMessage = (element, currentUserID, container) => {
  const outgoingOrIncoming = element.userId === currentUserID;
  const incomingMessageTemplate = document.createElement('div');
  incomingMessageTemplate.className = 'message d-flex ' + (outgoingOrIncoming ? 'justify-content-start' : 'justify-content-end');

  const chatBubble = document.createElement('div');
  chatBubble.className = 'chat-bubble ' + (outgoingOrIncoming ? 'outgoing' : 'incoming');

  const messageContent = document.createElement('p');
  messageContent.appendChild(document.createTextNode(element.message));

  chatBubble.appendChild(messageContent);

  incomingMessageTemplate.appendChild(chatBubble);
  container.appendChild(incomingMessageTemplate);
};

const refreshMessages = async () => {
  try {
    //to reset: localStorage.setItem('messages',null)
    const messageCache = JSON.parse(localStorage.getItem('messages'));
    console.log(messageCache, 'messageCache');
    let lastLocalId = 0;
    if (messageCache && typeof messageCache === 'object' && messageCache[messageCache.length - 1].hasOwnProperty('id'))
      lastLocalId = messageCache[messageCache.length - 1].id;

    const token = getToken();
    const response = await axios.get(domain + '/messages', { headers: { Authorization: token }, params: { loadFromId: lastLocalId }});

    const userId = response.data.id;
    const messages = response.data.response;

    const container = document.querySelector('#chat-bubble-container');
    container.innerHTML = '';
    messageCache.forEach(element => renderMessage(element, userId, container));
    messages.forEach(element => renderMessage(element, userId, container));

    const cachableMessages = [];
    if (messageCache) {
      for (let i = 0; i < messageCache.length;i++) {
        if (messageCache[i]) {
          cachableMessages.push(messageCache[i]);
        }
      }
    }
    console.log(cachableMessages);
    for (let i = 0; i < messages.length; i++) {
      cachableMessages.push(messages[i]);
    }
    console.log(cachableMessages, 'cachableMessages');
    const newCache = cachableMessages.length > 10 ? cachableMessages.slice(cachableMessages.length - 10) : cachableMessages;

    localStorage.setItem('messages', JSON.stringify(newCache));
  } catch (err) {
    console.log(err);
  }
};
window.addEventListener('DOMContentLoaded', refreshMessages);

//setInterval(refreshMessages,1000);

