
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
  const incomingMessageTemplate = document.createElement('div');
  incomingMessageTemplate.className = 'message d-flex justify-content-start';

  const chatBubble = document.createElement('div');
  chatBubble.className = 'chat-bubble ' + (element.userId === currentUserID ? 'outgoing' : 'incoming');

  const messageContent = document.createElement('p');
  messageContent.appendChild(document.createTextNode(element.message));

  chatBubble.appendChild(messageContent);

  incomingMessageTemplate.appendChild(chatBubble);
  container.appendChild(incomingMessageTemplate);
};

const refreshMessages = async () => {
  try {
    const token = getToken();
    const response = await axios.get(domain + '/messages', { headers: { Authorization: token }});
    const userId = response.data.id;
    const messages = response.data.response;
    const container = document.querySelector('#chat-bubble-container');
    container.innerHTML = '';
    messages.forEach(element => renderMessage(element, userId, container));
  } catch (err) {
    console.log(err);
  }
};
window.addEventListener('DOMContentLoaded', refreshMessages);
