const domain = 'http://localhost:3000';

const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token;
  } catch (err) {
    console.log(err);
  }
};

const socket = window.io('http://localhost:3000', {
  extraHeaders:
    { Authorization: getToken() },
});

socket.on('connect', () => {
  console.log(`you connected with id ${socket.id}`);
});

socket.on('refresh', async () => {
  PageRefresh();
});

const logOutButton = document.querySelector('#logout');
async function logOutUser(e) {
  e.preventDefault();
  const token = getToken();
  await axios.delete(domain + '/auth/removeSocketId', { headers: { Authorization: token }});
  localStorage.removeItem('token');
  console.log('token removed!');
  window.location.href = '../login/login.html';
}
logOutButton.addEventListener('click', logOutUser);

const hideInputForm = () => {
  const inputBar = document.getElementById('inputBar');
  inputBar.style.visibility = 'hidden';
};

const showInputForm = () => {
  const inputBar = document.getElementById('inputBar');
  inputBar.style.visibility = 'visible';
};

const showAdmin = () => {
  const hidden = document.getElementsByClassName('admin');
  for (let i = 0; i < hidden.length; i++) {
    hidden[i].style.visibility = 'visible';
  }
};
const hideAdmin = () => {
  const hidden = document.getElementsByClassName('admin');
  for (let i = 0; i < hidden.length; i++) {
    hidden[i].style.visibility = 'hidden';
  }
};

const inputButton = document.getElementById('inputButton');
const sendMessage = async e => {
  e.preventDefault();
  const inputMessageField = document.getElementById('input');
  const message = inputMessageField.value;
  const messageContainer = document.getElementById('chat-bubble-container');
  const groupId = messageContainer.getAttribute('data-id');
  const token = getToken();
  await axios.post(domain + '/group/message', { message, groupId }, { headers: { Authorization: token }});
  socket.emit('send-message', message, groupId);
  inputMessageField.value = '';
  refreshMessages();
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
    const groupId = messageContainer.getAttribute('data-id');
    messageContainer.innerHTML = '';
    if (groupId) {
      showInputForm();
      const token = getToken();
      const adminResponse = await axios.get(domain + `/group/${groupId}/userAdminStatus`, { headers: { Authorization: token }});
      const adminStatus = adminResponse.data.adminStatus;
      if (adminStatus === true) {
        showAdmin();
      } else {
        hideAdmin();
      }

      //to reset message cache:
      //localStorage.setItem(`${groupId} message cache`, null);
      const messageCache = JSON.parse(localStorage.getItem(`${groupId} message cache`));

      let lastLocalId = 0;
      if (messageCache && typeof messageCache === 'object' && messageCache[messageCache.length - 1] && Object.prototype.hasOwnProperty.call(messageCache[messageCache.length - 1].dataValues, 'id'))
        lastLocalId = messageCache[messageCache.length - 1].dataValues.id;

      const response = await axios.get(domain + `/group/${groupId}/messages`, { headers: { Authorization: token }, params: { loadFromId: lastLocalId }});
      console.log(response);
      const messages = response.data.messagesWithUser;
      console.log(messages);
      const container = document.querySelector('#chat-bubble-container');
      container.innerHTML = '';
      console.log(messageCache, messages);
      if (messageCache) {
        messageCache.forEach(element => renderMessage(element, container));
      }
      if (messages) {
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
      if (messages) {
        for (let i = 0; i < messages.length; i++) {
          cachableMessages.push(messages[i]);
        }
      }
      const newCache = cachableMessages.length > 10 ? cachableMessages.slice(cachableMessages.length - 10) : cachableMessages;

      localStorage.setItem(`${groupId} message cache`, JSON.stringify(newCache));
    }
  } catch (err) {
    console.log(err);
  }
};

const groupsContainer = document.getElementById('groupsContainer');
const loadGroupMessages = async e => {
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

const textInputModal = document.getElementById('textInputModal');

// adds focus to the textbox.
textInputModal.addEventListener('shown.bs.modal', function () {
  const textInput = document.getElementById('textInput');
  textInput.focus();
});

const fileButton = document.getElementById('fileButton');
const uploadFileAndCreateLink = async () => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const fileButton = document.getElementById('fileButton');
    const file = fileButton.files[0];
    console.log(file);
    const token = getToken();
    const response = await axios.post(domain + `/group/${groupId}/upload`, { file }, { headers: { Authorization: token }});
    if (response.status === 200) {
      const a = document.createElement('a');
      a.href = response.data.fileUrl;
      a.download = `${new Date}`;
      a.click();
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.log(err);
  }
};
fileButton.addEventListener('change', uploadFileAndCreateLink);

//***************************** */

const setAndCallGroupModal = () => {
  const modalHeading = document.getElementById('textInputModalLabel');
  modalHeading.innerText = 'Enter Group Name.';
  const modalOpenButton = document.getElementById('textInputModalButton');
  modalOpenButton.setAttribute('data-action', 'group');
  modalOpenButton.click();
};
const setCreateAndLeaveGroupEventListeners = () => {
  const createGroupButtonS = document.getElementById('createGroupS');
  const createGroupButtonL = document.getElementById('createGroupL');
  const breakPointWidth = 750;
  const screenWidth = window.innerWidth;
  let elementToUse = null;
  if (screenWidth < breakPointWidth) {
    elementToUse = createGroupButtonS;
    createGroupButtonL.removeEventListener('click', setAndCallGroupModal);
  } else {
    elementToUse = createGroupButtonL;
    createGroupButtonS.removeEventListener('click', setAndCallGroupModal);
  }
  elementToUse.addEventListener('click', setAndCallGroupModal);

  const leaveGroupButtonS = document.getElementById('leaveGroupS');
  const leaveGroupButtonL = document.getElementById('leaveGroupL');

  elementToUse = null;
  if (screenWidth < breakPointWidth) {
    elementToUse = leaveGroupButtonS;
    leaveGroupButtonL.removeEventListener('click', leaveCurrentGroup);
  } else {
    elementToUse = leaveGroupButtonL;
    leaveGroupButtonS.removeEventListener('click', leaveCurrentGroup);
  }
  elementToUse.addEventListener('click', leaveCurrentGroup);
};

const leaveCurrentGroup = async () => {
  try {
    const token = getToken();
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    leaveGroupRoom(groupId);
    await axios.delete(domain + `/group/${groupId}/leavegroup`, { headers: { Authorization: token }});
    messageContainer.value = '';
    PageRefresh();
    refreshMessages();
    hideInputForm();
    hideAdmin();
  } catch (err) {
    console.log(err);
  }
};

const setAndCallUserModal = () => {
  const modalHeading = document.getElementById('textInputModalLabel');
  modalHeading.innerText = 'Enter Invitee email.';
  const modalOpenButton = document.getElementById('textInputModalButton');
  modalOpenButton.setAttribute('data-action', 'user');
  modalOpenButton.click();
};

const textInputSubmitButton = document.getElementById('textInputSubmit');
const addUserOrCreateGroupfunction = async () => {
  const modalOpenButton = document.getElementById('textInputModalButton');
  try {
    const token = getToken();
    const action = modalOpenButton.getAttribute('data-action');
    const inputField = document.getElementById('textInput');
    if (action === 'group') {
      const name = inputField.value;

      await axios.post(domain + '/group/new', {
        name,
      }, { headers: { Authorization: token }});
      inputField.value = '';

      PageRefresh();
    } else if (action === 'user') {
      const email = inputField.value;
      const messageContainer = document.getElementById('chat-bubble-container');
      const groupId = messageContainer.getAttribute('data-id');
      const userId = await axios.patch(domain + `/group/${groupId}/${email}/add`, {}, { headers: { Authorization: token }});
      socket.emit('add user', userId, groupId);
      PageRefresh();
      inputField.value = '';
    }
    const closeModalButton = document.getElementById('textInputClose');
    closeModalButton.click();

    modalOpenButton.setAttribute('data-action', null);
  } catch (err) {
    console.log(err);
    modalOpenButton.setAttribute('data-action', null);
  }
};

textInputSubmitButton.addEventListener('click', addUserOrCreateGroupfunction);

//***************************** */

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

const joinGroupRooms = groups => {
  groups.forEach(e => {
    const groupRoom = e.id;
    socket.emit('join-room', groupRoom, response => {
      console.log(response);
    });
  });
};

const leaveGroupRoom = groupId => {
  socket.emit('leave-room', groupId, response => {
    console.log(response);
  });
};

const PageRefresh = async() => {
  try {
    const groups = await getCurrentUserGroups();
    renderUserGroups(groups);
    joinGroupRooms(groups);
  } catch (err) {
    console.log(err);
  }
};
window.addEventListener('DOMContentLoaded', PageRefresh);

const renderUserGroups = groups => {
  console.log(groups);
  const groupsContainer = document.getElementById('groupsContainer');
  groupsContainer.innerHTML = '';
  if (groups) {
    groups.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    try {
      groups.forEach(e => {
        const group = document.createElement('div');
        const groupName = document.createElement('div');
        groupName.className = 'card-body group';
        groupName.appendChild(document.createTextNode(e.name));
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

const getUserToRemoveFromGroup = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const token = getToken();
    const response = await axios.get(domain + `/group/${groupId}/otherUsers`, { headers: { Authorization: token }});
    const userList = response.data;
    console.log(userList);
    const userListContainer = document.getElementById('userListContainer');
    userListContainer.innerHTML = '';
    const userIdHolder = document.getElementById('selectedUserId');
    userList.map((e, i) => {
      const radio = document.createElement('input');
      const radioContainer = document.createElement('div');
      const radioLabel = document.createElement('label');
      radio.type = 'radio';
      radio.name = 'userList'; // Set the name attribute to group the radio buttons
      radio.className = 'form-check-input';
      radioLabel.className = 'form-check-label';
      radioContainer.className = 'form-check';
      radioLabel.innerText = e.name;
      radio.setAttribute('data-id', e.id);
      radio.id = i;
      radioLabel.for = i;
      radioContainer.appendChild(radio);
      radioContainer.appendChild(radioLabel);
      radio.onclick = () => {
        userIdHolder.textContent = radio.getAttribute('data-id');
        console.log(radio.getAttribute('data-id'));
      };
      userListContainer.appendChild(radioContainer);
    });

    userListSubmitButton.setAttribute('action', 'removeUser');
    const userListModalButton = document.getElementById('userListModalButton');
    userListModalButton.click();
  } catch (err) {
    console.log(err);
    userListSubmitButton.setAttribute('action', null);
  }
};

const userListSubmitButton = document.getElementById('userListSubmit');
const getAction = async e => {
  try {
    const action = e.target.getAttribute('action');

    const token = getToken();
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const userId = document.getElementById('selectedUserId').textContent;
    if (action === 'removeUser') {
      const response = await axios.delete(domain + `/group/${groupId}/${userId}/delete`, { headers: { Authorization: token }});
      socket.emit('remove user', userId, groupId);
      console.log(response);
    } else if (action === 'adminUser') {
      const response = await axios.patch(domain + `/group/${groupId}/${userId}/admin`, {}, { headers: { Authorization: token }});
      socket.emit('admin user', userId, groupId);
      console.log(response);
    }
    const closeModalButton = document.getElementById('userListClose');
    closeModalButton.click();
    e.target.setAttribute('action', null);
  } catch (err) {
    console.log(err);
    e.target.setAttribute('action', null);
  }
};

userListSubmitButton.addEventListener('click', getAction);

const makeUserGroupAdmin = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const token = getToken();
    const response = await axios.get(domain + `/group/${groupId}/otherUsers`, { headers: { Authorization: token }});
    const userList = response.data;
    const userListContainer = document.getElementById('userListContainer');
    userListContainer.innerHTML = '';
    const userIdHolder = document.getElementById('selectedUserId');
    userList.map((e, i) => {
      const radio = document.createElement('input');
      const radioContainer = document.createElement('div');
      const radioLabel = document.createElement('label');
      radio.type = 'radio';
      radio.name = 'userList'; // Set the name attribute to group the radio buttons
      radio.className = 'form-check-input';
      radioLabel.className = 'form-check-label';
      radioContainer.className = 'form-check';
      radioLabel.innerText = e.name;
      radio.setAttribute('data-id', e.id);
      radio.id = i;
      radioLabel.for = i;
      radioContainer.appendChild(radio);
      radioContainer.appendChild(radioLabel);
      radio.onclick = () => {
        userIdHolder.textContent = radio.getAttribute('data-id');
      };
      userListContainer.appendChild(radioContainer);
    });

    userListSubmitButton.setAttribute('action', 'adminUser');
    const userListModalButton = document.getElementById('userListModalButton');
    userListModalButton.click();
  } catch (err) {
    console.log(err);
    userListSubmitButton.setAttribute('action', null);
  }
};

const setRemoveUserEventListener = () => {
  const removeUserButtonS = document.getElementById('removeUserS');
  const removeUserButtonL = document.getElementById('removeUserL');

  removeUserButtonS.removeEventListener('click', getUserToRemoveFromGroup);
  removeUserButtonL.removeEventListener('click', getUserToRemoveFromGroup);

  const screenWidth = window.innerWidth;
  let elementToUse;
  if (screenWidth < 750) {
    elementToUse = removeUserButtonS;
  } else {
    elementToUse = removeUserButtonL;
  }
  elementToUse.addEventListener('click', getUserToRemoveFromGroup);
};

const setMakeUserAdminEventListener = () => {
  const adminUserButtonS = document.getElementById('adminUserS');
  const adminUserButtonL = document.getElementById('adminUserL');

  const screenWidth = window.innerWidth;
  let elementToUse;
  if (screenWidth < 750) {
    elementToUse = adminUserButtonS;
    adminUserButtonL.removeEventListener('click', makeUserGroupAdmin);
  } else {
    elementToUse = adminUserButtonL;
    adminUserButtonS.removeEventListener('click', makeUserGroupAdmin);
  }
  elementToUse.addEventListener('click', makeUserGroupAdmin);
};

const setUserModalEventListener = () => {
  const addUserButtonL = document.getElementById('addUserL');
  const addUserButtonS = document.getElementById('addUserS');

  const screenWidth = window.innerWidth;
  let elementToUse;
  if (screenWidth < 750) {
    elementToUse = addUserButtonS;
    addUserButtonL.removeEventListener('click', setAndCallGroupModal);
  } else {
    elementToUse = addUserButtonL;
    addUserButtonS.removeEventListener('click', setAndCallGroupModal);
  }
  elementToUse.addEventListener('click', setAndCallUserModal);
};

const onWindowRefreshAndResize = () => {
  axios.defaults.headers.common['Authorization']=getToken();
  setRemoveUserEventListener();
  setMakeUserAdminEventListener();
  setUserModalEventListener();
  setCreateAndLeaveGroupEventListeners();
};

window.addEventListener('DOMContentLoaded', onWindowRefreshAndResize);
window.addEventListener('resize', onWindowRefreshAndResize);
