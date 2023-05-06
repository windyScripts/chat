
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

const inputButton = document.getElementById('inputButton');
const sendMessage = async e => {
  e.preventDefault();
  const inputMessageField = document.getElementById('input');
  const message = inputMessageField.value;
  const messageContainer = document.getElementById('chat-bubble-container')
  const groupId = messageContainer.getAttribute('data-id');
  const token = getToken();
  await axios.post(domain + '/group/message', { message, groupId }, { headers: { Authorization: token }});
  inputMessageField.value = '';
  await refreshMessages();
};
inputButton.addEventListener('click', sendMessage);

const renderMessage = (element, container) => {
  const outgoingOrIncoming = element.user;
  const incomingMessageTemplate = document.createElement('div');
  incomingMessageTemplate.className = 'message d-flex ' + (outgoingOrIncoming ? 'justify-content-start' : 'justify-content-end');

  const chatBubble = document.createElement('div');
  chatBubble.className = 'chat-bubble ' + (outgoingOrIncoming ? 'outgoing' : 'incoming');

  const messageContent = document.createElement('p');
  messageContent.appendChild(document.createTextNode(element.dataValues.message));

  chatBubble.appendChild(messageContent);

  incomingMessageTemplate.appendChild(chatBubble);
  container.appendChild(incomingMessageTemplate);
};

const refreshMessages = async () => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    messageContainer.innerHTML='';
    const groupId = messageContainer.getAttribute('data-id');
    console.log(groupId)
    //to reset message cache: 
    localStorage.setItem(`${groupId} message cache`,null)
    const messageCache = JSON.parse(localStorage.getItem(`${groupId} message cache`));
    console.log(messageCache);
    let lastLocalId = 0;
    if (messageCache && typeof messageCache === 'object' && messageCache[messageCache.length - 1] && messageCache[messageCache.length - 1].dataValues.hasOwnProperty('id'))
      lastLocalId = messageCache[messageCache.length - 1].dataValues.id;

    const token = getToken();
    
    
    
    const response = await axios.get(domain + `/group/${groupId}/messages`, { headers: { Authorization: token }, params: { loadFromId: lastLocalId }});
    console.log(response);
    const messages = response.data.messagesWithUser;
    console.log(messages);
    const container = document.querySelector('#chat-bubble-container');
    container.innerHTML = '';
    console.log(messageCache,messages)
    if(messageCache){
        messageCache.forEach(element => renderMessage(element, container));
    }
    if(messages){
        messages.forEach(element => renderMessage(element, container));
    }
    

    const cachableMessages = [];
    if (messageCache) {
      for (let i = 0; i < messageCache.length;i++) {
        if (messageCache[i]) {
          cachableMessages.push(messageCache[i]);
        }
      }
    }
    if(messages){
    for (let i = 0; i < messages.length; i++) {
      cachableMessages.push(messages[i]);
    }
}
    const newCache = cachableMessages.length > 10 ? cachableMessages.slice(cachableMessages.length - 10) : cachableMessages;

    localStorage.setItem(`${groupId} message cache`, JSON.stringify(newCache));
  } catch (err) {
    console.log(err);
  }
};

const groupsContainer = document.getElementById('groupsContainer');
const loadGroupMessages = async e => {
    console.log(e.target);
  if (e.target.classList.contains('group')) {
    try {
      const messageContainer = document.getElementById('chat-bubble-container');
      messageContainer.setAttribute('data-id', e.target.getAttribute('data-id'));
      refreshMessages();
    } catch (err) {
      console.log(err);
    }
  }
};
groupsContainer.addEventListener('click', loadGroupMessages);

//setInterval(refreshMessages,1000);

const groupDetailsModal = document.getElementById('groupDetailsModal');

// adds focus to the textbox.
groupDetailsModal.addEventListener('shown.bs.modal', function () {
  const groupNameInput = document.getElementById('groupDetailsInput');
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
    const closeModalButton = document.getElementById("groupDetailsClose");
    closeModalButton.click();
    PageRefresh()
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



const PageRefresh = async() => {
  try {
    const groups = await getCurrentUserGroups();
    renderUserGroups(groups);
  } catch (err) {
    console.log(err);
  }
};
window.addEventListener('DOMContentLoaded', PageRefresh);

const renderUserGroups = groups => {
  console.log(groups);
  if (groups) {
    const groupsContainer = document.getElementById('groupsContainer');
    groups.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    try {
      groups.forEach(e => {
        const group = document.createElement('div');
        const groupName = document.createElement('div');
        groupName.className = 'card-body group';
        groupName.appendChild(document.createTextNode(e.name));;
        group.appendChild(groupName);
        group.className = 'card';
        groupName.setAttribute('data-id', e.id);
        groupsContainer.appendChild(group);
      });
    } catch (err) {
      console.log(err);
    }
  }
};


const addUserButtonL = document.getElementById('addUserL');
const addUserButtonS = document.getElementById('addUserS');
const addUserToGroup = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');

  } catch (err) {
    console.log(err);
  }
};
addUserButtonL.addEventListener('click', addUserToGroup);
addUserButtonS.addEventListener('click', addUserToGroup);

const removeUserButtonS = document.getElementById('removeUserS');
const removeUserButtonL = document.getElementById('removeUserL');
const getUserToRemoveFromGroup = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const response = await axios.get(domain+`/group/${groupId}/users`)
    const userList = response.data
    const userListContainer = document.getElementById('userListContainer')
    const userIdHolder = document.getElementById('selectedUserId')
    userList.map(e,i =>{
        const radio = document.createElement('input');
        const radioContainer = document.createElement('div');
        const radioLabel = document.createElement('label');
  radio.type = 'radio';
  radio.name = 'userList'; // Set the name attribute to group the radio buttons
  radio.className = "form-check-input"
  radioLabel.className = "form-check-label"
  radioContainer.className = "form-check"
  radioLabel.innerText = e.name;
  radio.setAttribute('data-id',e.id)
  radio.id = i;
  radioLabel.for=i
  radioContainer.appendChild(radio)
  radioContainer.appendChild(radioLabel)
  radio.onclick = () => {userIdHolder.textContent = radio.getAttribute('data-id')}
  userListContainer.appendChild(radioContainer)
    });
    
    userListSubmitButton.setAttribute('action','removeUser');
    const modalOpener = document.createElement('button');
    modalOpener.setAttribute( "data-bs-toggle","modal")
    modalOpener.setAttribute("data-bs-target","#userListModal")
    modalOpener.click();

    
    console.log('get list of users, show it on a modal and have them select one or more users to remove');
  } catch (err) {
    console.log(err);
  }
};
removeUserButtonS.addEventListener('click', getUserToRemoveFromGroup);
removeUserButtonL.addEventListener('click', getUserToRemoveFromGroup);

const userListSubmitButton = document.getElementById('userListSubmit')
getAction = async (e) => {
    try{
    const action = e.getAttribute('action')
    if(action===removeUser){
        const groupId = messageContainer.getAttribute('data-id');
        const userId = document.getElementById('selectedUserId').value;
        const response = await axios.delete(domain+`/${groupId}/${userId}`)
        console.log(response);
    }
}catch(err){
    console.log(err);
}
}

userListSubmitButton.addEventListener('click',getAction)



const adminUserButton = document.getElementById('adminUser');
const makeUserGroupAdmin = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    console.log('modify usergroup.');
  } catch (err) {
    console.log(err);
  }
};