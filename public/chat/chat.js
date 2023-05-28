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
  await axios.delete(domain + '/auth/removeSocketId');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  console.log('token removed!');
  window.location.href = '../login/login.html';
}
logOutButton.addEventListener('click', logOutUser);

const hideGroupElements = () => {
  const inputBar = document.getElementById('inputBar');
  const leaveGroupButton = document.getElementById('leaveGroupL');
  const leaveDropDownButton = document.getElementById('leaveGroupS');
  inputBar.style.visibility = 'hidden';
  leaveGroupButton.style.visibility = 'hidden';
  leaveDropDownButton.style.display = 'none';
};

const showGroupElements = () => {
  const inputBar = document.getElementById('inputBar');
  const leaveGroupButton = document.getElementById('leaveGroupL');
  const leaveDropDownButton = document.getElementById('leaveGroupS');
  inputBar.style.visibility = 'visible';
  leaveGroupButton.style.visibility = 'visible';
  leaveDropDownButton.style.display = 'list-item';
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
  await axios.post(domain + '/group/message', { message, groupId });
  const room = groupId;
  socket.emit('send-message', room, msg => {
    console.log(msg);
    PageRefresh();
    refreshMessages();
  });
  inputMessageField.value = '';
};
inputButton.addEventListener('click', sendMessage);

const renderMessage = (element, container) => {
  const outgoingOrIncoming = element.currentUser;
  const MessageTemplate = document.createElement('div');
  MessageTemplate.className = ' message d-flex ' + (outgoingOrIncoming ? 'justify-content-end' : 'justify-content-start');

  const chatBubble = document.createElement('div');
  chatBubble.className = ' chat-bubble message-body ' + (outgoingOrIncoming ? 'outgoing' : 'incoming');

  const messageContent = document.createElement('p');
  messageContent.className = ' message-body ';
  messageContent.appendChild(document.createTextNode((outgoingOrIncoming ? 'You: ' : `${element.user.name}: `) + `${element.message}`));

  chatBubble.appendChild(messageContent);

  MessageTemplate.appendChild(chatBubble);
  container.appendChild(MessageTemplate);
};

const refreshMessages = async () => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    messageContainer.innerHTML = '';
    if (groupId) {
      showGroupElements();
      const adminResponse = await axios.get(domain + `/group/${groupId}/userAdminStatus`);
      const adminStatus = adminResponse.data.adminStatus;
      if (adminStatus === true) {
        showAdmin();
      } else {
        hideAdmin();
      }

      const userEmail = localStorage.getItem('email');
      //to reset message cache:
      //localStorage.setItem(`${userEmail}:${groupId} message cache`, null);
      const messageCache = JSON.parse(localStorage.getItem(`${userEmail}:${groupId} message cache`));
      let lastLocalId = 0;
      if (messageCache && typeof messageCache === 'object' && messageCache[messageCache.length - 1] && Object.prototype.hasOwnProperty.call(messageCache[messageCache.length - 1], 'id'))
        lastLocalId = messageCache[messageCache.length - 1].id;
      const response = await axios.get(domain + `/group/${groupId}/messages`, { params: { loadFromId: lastLocalId }});
      const messages = response.data;
      const container = document.querySelector('#chat-bubble-container');
      container.innerHTML = '';
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

      localStorage.setItem(`${userEmail}:${groupId} message cache`, JSON.stringify(newCache));
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

const userEmailInputModal = document.getElementById('userEmailInputModal');

// adds focus to the textbox.
userEmailInputModal.addEventListener('shown.bs.modal', function () {
  const userEmailInput = document.getElementById('userEmailField');
  userEmailInput.focus();
});

const groupModal = document.getElementById('groupModal');

// adds focus to the textbox.
groupModal.addEventListener('shown.bs.modal', function () {
  const groupNameField = document.getElementById('groupNameField');
  groupNameField.focus();
});

const fileButton = document.getElementById('fileButton');
const uploadFileAndCreateLink = async e => {
  e.preventDefault();
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const fileButton = document.getElementById('fileButton');
    const file = fileButton.files[0];
    const formData = new FormData();
    const date = new Date();
    formData.append(`${date.getTime}.png`, file);
    const response = await axios.post(domain + `/group/${groupId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status === 200) {
      socket.emit('send-message', groupId, msg => {
        console.log(msg);
        refreshMessages();
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.log(err);
  }
};
fileButton.addEventListener('change', uploadFileAndCreateLink);

const setLeaveGroupEventListener = () => {

  const leaveGroupButtonS = document.getElementById('leaveGroupS');
  const leaveGroupButtonL = document.getElementById('leaveGroupL');
  const screenWidth = window.innerWidth;
  const breakPointWidth = 750;

  let elementToUse = null;
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
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    leaveGroupRoom(groupId);
    await axios.delete(domain + `/group/${groupId}/leavegroup`);
    messageContainer.value = '';
    socket.emit('leave-room', groupId, msg => {
      console.log(msg);
      PageRefresh();
      refreshMessages();
    });

    hideGroupElements();
    hideAdmin();
  } catch (err) {
    console.log(err);
  }
};

const groupSubmitButton = document.getElementById('groupSubmit');
const createGroup = async () => {
  const groupNameField = document.getElementById('groupNameField')
  try {
      const name = groupNameField.value;

      await axios.post(domain + '/group/new', {
        name,
      });
      groupNameField.value = '';

      PageRefresh();
    const closeModalButton = document.getElementById('groupClose');
    closeModalButton.click();
  } catch (err) {
    console.log(err);
  }
};
groupSubmitButton.addEventListener('click',createGroup)

const userEmailInputSubmitButton = document.getElementById('userEmailInputSubmit')
const addUser = async () => {
  try {
    const inputField = document.getElementById('userEmailField');
      const email = inputField.value;
      const messageContainer = document.getElementById('chat-bubble-container');
      const groupId = messageContainer.getAttribute('data-id');
      const response = await axios.patch(domain + `/group/${groupId}/${email}/add`, {});
      const userId = response.data.userId;
      socket.emit('add user', userId, groupId, msg => {
        console.log(msg);
        PageRefresh();
      });

      inputField.value = '';
    const closeModalButton = document.getElementById('userEmailInputClose');
    closeModalButton.click();
  } catch (err) {
    console.log(err);
  }
};
userEmailInputSubmitButton.addEventListener('click', addUser);

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

const getCurrentUserGroups = async () => {
  try {
    const response = await axios.get(domain + '/group/groups');
    const groups = response.data;
    return groups;
  } catch (err) {
    console.log(err);
  }
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

const renderUserGroups = groups => {
  const groupsContainer = document.getElementById('groupsContainer');
  groupsContainer.innerHTML = '';
  if (groups) {
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

const createAnchorsAndAppend = (array, container, idStore) => {
  array.map((e, i) => {
    const radio = document.createElement('input');
    const radioContainer = document.createElement('div');
    const radioLabel = document.createElement('label');
    radio.type = 'radio';
    radio.name = 'userList';
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
      idStore.textContent = radio.getAttribute('data-id');
    };
    container.appendChild(radioContainer);
  });
};

const getUserToRemoveFromGroup = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const response = await axios.get(domain + `/group/${groupId}/otherUsers`);
    const userList = response.data;
    const userListContainer = document.getElementById('userListContainer');
    userListContainer.innerHTML = '';
    const userIdHolder = document.getElementById('selectedUserId');
    createAnchorsAndAppend(userList, userListContainer, userIdHolder);

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
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const userId = document.getElementById('selectedUserId').textContent;
    if (action === 'removeUser') {
      await axios.delete(domain + `/group/${groupId}/${userId}/delete`);
      socket.emit('remove user', userId, groupId);
    } else if (action === 'adminUser') {
      await axios.patch(domain + `/group/${groupId}/${userId}/admin`, {});
      socket.emit('admin user', userId, groupId);
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
    const response = await axios.get(domain + `/group/${groupId}/otherUsers`);
    const userList = response.data;
    const userListContainer = document.getElementById('userListContainer');
    userListContainer.innerHTML = '';
    const userIdHolder = document.getElementById('selectedUserId');
    createAnchorsAndAppend(userList, userListContainer, userIdHolder);
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
  const breakPointWidth = 750;
  let elementToUse;
  if (screenWidth < breakPointWidth) {
    elementToUse = adminUserButtonS;
    adminUserButtonL.removeEventListener('click', makeUserGroupAdmin);
  } else {
    elementToUse = adminUserButtonL;
    adminUserButtonS.removeEventListener('click', makeUserGroupAdmin);
  }
  elementToUse.addEventListener('click', makeUserGroupAdmin);
};

const onWindowRefresh = () => {
  axios.defaults.headers.common['Authorization'] = getToken();
  setRemoveUserEventListener();
  setMakeUserAdminEventListener();
  setLeaveGroupEventListener();
  PageRefresh();
};

const onWindowResize = () => {
  setRemoveUserEventListener();
  setMakeUserAdminEventListener();
  setLeaveGroupEventListener();
};

window.addEventListener('DOMContentLoaded', onWindowRefresh);
window.addEventListener('resize', onWindowResize);
