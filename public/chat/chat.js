
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
};
inputButton.addEventListener('click', addMessage);

/* const incomingMessageTemplate = document.createElement('div');
incomingMessageTemplate.className = 'message';

const chatBubble = document.createElement('div');
chatBubble.className = 'chat-bubble incoming';

const messageContent = document.createElement('p');
messageContent.appendChild(document.createTextNode('message here'));

chatBubble.appendChild(messageContent);
chatBubble.appendChild(document.createElement('div')).className = 'fill';

incomingMessageTemplate.appendChild(chatBubble); */
