
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

const renderMessage = (element, container) => {
  const outgoingOrIncoming = element.user;
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

const refreshMessages = async e => {
  try {
    //to reset message cache: localStorage.setItem('messages',null)
    const messageCache = JSON.parse(localStorage.getItem(`${e.target.name} message cache`));
    let lastLocalId = 0;
    if (messageCache && typeof messageCache === 'object' && messageCache[messageCache.length - 1].hasOwnProperty('id'))
      lastLocalId = messageCache[messageCache.length - 1].id;

    const token = getToken();
    const groupId = e.target.getAttribute('data-id');
    //const response = await axios.get(domain + '/messages', { headers: { Authorization: token }, params: { loadFromId: lastLocalId }});
    const response = await axios.post(domain + '/group/messages', { groupId }, { headers: { Authorization: token }, params: { loadFromId: lastLocalId }});

    const messages = response.data.messages;

    const container = document.querySelector('#chat-bubble-container');
    container.innerHTML = '';
    messageCache.forEach(element => renderMessage(element, container));
    messages.forEach(element => renderMessage(element, container));

    const cachableMessages = [];
    if (messageCache) {
      for (let i = 0; i < messageCache.length;i++) {
        if (messageCache[i]) {
          cachableMessages.push(messageCache[i]);
        }
      }
    }
    //console.log(cachableMessages);
    for (let i = 0; i < messages.length; i++) {
      cachableMessages.push(messages[i]);
    }
    //console.log(cachableMessages, 'cachableMessages');
    const newCache = cachableMessages.length > 10 ? cachableMessages.slice(cachableMessages.length - 10) : cachableMessages;

    localStorage.setItem(`${e.target.name} message cache`, JSON.stringify(newCache));
  } catch (err) {
    console.log(err);
  }
};

const groupsContainer = document.getElementById('groupsContainer');
const loadGroupMessages = async e => {
  if (e.target.classList.contains('group')) {
    try {
      refreshMessages(e);
    } catch (err) {
      console.log(err);
    }
  }
};
groupsContainer.addEventListener('click', loadGroupMessages);

//setInterval(refreshMessages,1000);

const groupDetailsModal = document.getElementById('groupDetailsModal');
const groupNameInput = document.getElementById('groupDetailsModalLabel');

// this is from https://getbootstrap.com/docs/5.0/components/modal/ , still not sure what it's supposed to do.
groupDetailsModal.addEventListener('shown.bs.modal', function () {
  groupNameInput.focus();
});

const groupNameSubmitButton = document.getElementById('groupDetailsSubmit');

const createGroup = async () => {
  try {
    const token = getToken();
    const groupNameField = document.getElementById('groupDetailsInput');
    const groupName = groupNameField.value;
    await axios.post(domain + '/group/new', {
      name: groupName,
    }, { headers: { Authorization: token }});
  } catch (err) {
    console.log(err);
  }
};
groupNameSubmitButton.addEventListener('click', createGroup);

const getCurrentUserGroups = async () => {
  try {
    const token = getToken();
    const response = await axios.get(domain + '/group/groups', { headers: { Authorization: token }});
    const groups = response.data;
    console.log(groups);
    return groups;
  } catch (err) {
    console.log(err);
  }
};

const removeUserFromGroup = async() => {
  try {
    // build admin system first
  } catch (err) {

  }
};

const inviteUserToGroup = async() => {
  try {
    // build invite system first

  } catch (err) {

  }
};

const onPageRefresh = async() => {
  try {
    const groups = await getCurrentUserGroups();
    renderUserGroups(groups);
  } catch (err) {
    console.log(err);
  }
};
window.addEventListener('DOMContentLoaded', onPageRefresh);

const renderUserGroups = groups => {
  console.log(groups);
  if (groups) {
    const groupsContainer = document.getElementById('groupsContainer');
    groups.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    try {
      groups.forEach(e => {
        const group = document.createElement('div');
        const groupName = document.createElement('div');
        groupName.className = 'card-body';
        const paragraphNode = document.createElement('p');
        paragraphNode.appendChild(document.createTextNode(e.name));
        groupName.appendChild(paragraphNode);
        group.appendChild(groupName);
        group.className = 'card group';
        group.setAttribute('data-id', e.id);
        groupsContainer.appendChild(group);
      });
    } catch (err) {
      console.log(err);
    }
  }
};

/*                 <div class="card" style="width: 18rem;">
                    <img src="..." class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk
                            of the card's content.</p>
                        <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                </div> */
