
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

const textInputModal = document.getElementById('textInputModal');

// adds focus to the textbox.
textInputModal.addEventListener('shown.bs.modal', function () {
  const textInput = document.getElementById('textInput');
  textInput.focus();
});

//***************************** */
         
const setAndCallGroupModal = () => {
const modalHeading = document.getElementById('textInputModalLabel')
modalHeading.innerText="Enter Group Name."
const modalOpenButton = document.getElementById('textInputModalButton')
modalOpenButton.setAttribute('data-action','group')
modalOpenButton.click();
}
const SetcreateAndLeaveGroupEventListeners = () => {
    const createGroupButtonS = document.getElementById('createGroupS')
    const createGroupButtonL = document.getElementById('createGroupL')
    const breakPointWidth = 750;
    const screenWidth = window.innerWidth;
    let elementToUse = null;
    if(screenWidth<breakPointWidth){
        elementToUse = createGroupButtonS
        createGroupButtonL.removeEventListener('click', setAndCallGroupModal)
    }
    else{
        elementToUse = createGroupButtonL
        createGroupButtonS.removeEventListener('click', setAndCallGroupModal)
    }
    elementToUse.addEventListener('click', setAndCallGroupModal);

    const leaveGroupButtonS = document.getElementById('leaveGroupS');
    const leaveGroupButtonL = document.getElementById('leaveGroupL');

    elementToUse = null;
    if(screenWidth<breakPointWidth){
        elementToUse = leaveGroupButtonS
        leaveGroupButtonL.removeEventListener('click', leaveCurrentGroup);
    }
    else{
        elementToUse = leaveGroupButtonL
        leaveGroupButtonS.removeEventListener('click', leaveCurrentGroup);
    }
    elementToUse.addEventListener('click', leaveCurrentGroup);
}

const leaveCurrentGroup = async () => {
try{
    const token = getToken();
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    console.log(groupId);
    const response = await axios.delete(domain+`/group/${groupId}/leavegroup`, { headers: { Authorization: token }})
    console.log(response);

}catch(err){
    console.log(err);
}
}

const setAndCallUserModal = () => {
    const modalHeading = document.getElementById('textInputModalLabel')
    modalHeading.innerText="Enter Invitee userId."
    const modalOpenButton = document.getElementById('textInputModalButton')
    modalOpenButton.setAttribute('data-action','user')
    modalOpenButton.click();
}



const textInputSubmitButton = document.getElementById('textInputSubmit');
const addUserOrCreateGroupfunction = async () => {
    const modalOpenButton = document.getElementById('textInputModalButton')
    try {
      const token = getToken();
      const action = modalOpenButton.getAttribute('data-action')
      const inputField = document.getElementById('textInput');
      const input = inputField.value;
      inputField.value = '';
        if(action==='group'){
            await axios.post(domain + '/group/new', {
                name: input,
              }, { headers: { Authorization: token }});

              PageRefresh()
        }
        else if(action==='user'){
            const messageContainer = document.getElementById('chat-bubble-container');
            const groupId = messageContainer.getAttribute('data-id');
            await axios.patch(domain +`/group/${groupId}/${input}/add`,{},{ headers: { Authorization: token }})
        }
      
      const closeModalButton = document.getElementById("textInputClose");
      closeModalButton.click();
      
      modalOpenButton.setAttribute('data-action',null)
    } catch (err) {
      console.log(err);
      modalOpenButton.setAttribute('data-action',null)
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
  const groupsContainer = document.getElementById('groupsContainer');
  groupsContainer.innerHTML = ''
  if (groups) {
    
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





const getUserToRemoveFromGroup = async() => {
  try {
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const token = getToken();
    const response = await axios.get(domain+`/group/${groupId}/users`,{ headers: { Authorization: token }})
    const userList = response.data
    console.log(userList);
    const userListContainer = document.getElementById('userListContainer')
    userListContainer.innerHTML='';
    const userIdHolder = document.getElementById('selectedUserId')
    userList.map((e,i) =>{
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
  radio.onclick = () => {
    userIdHolder.textContent = radio.getAttribute('data-id');
    console.log(radio.getAttribute('data-id'))
}
  userListContainer.appendChild(radioContainer)
    });
    
    userListSubmitButton.setAttribute('action','removeUser');
    const userListModalButton = document.getElementById('userListModalButton')
    userListModalButton.click()
 /*    const modalOpener = document.createElement('button');
    modalOpener.setAttribute( "data-bs-toggle","modal")
    modalOpener.setAttribute("data-bs-target","#userListModal")
    //console.log(modalOpener,"button");
    modalOpener.click(); */

    
    console.log('get list of users, show it on a modal and have them select one or more users to remove');
  } catch (err) {
    console.log(err);
    userListSubmitButton.setAttribute('action',null)
  }
};



const userListSubmitButton = document.getElementById('userListSubmit')
const getAction = async (e) => {
    try{
    const action = e.target.getAttribute('action')
    
    const token = getToken();
    const messageContainer = document.getElementById('chat-bubble-container');
    const groupId = messageContainer.getAttribute('data-id');
    const userId = document.getElementById('selectedUserId').textContent;
    if(action==='removeUser'){
        const response = await axios.delete(domain+`/group/${groupId}/${userId}/delete`,{ headers: { Authorization: token }})
        console.log(response);
    }
    else if(action==='adminUser'){
        const response = await axios.patch(domain+`/group/${groupId}/${userId}/admin`,{ headers: { Authorization: token }})
        console.log(response);  
        
}
const closeModalButton = document.getElementById("userListClose");
closeModalButton.click();
e.target.setAttribute('action',null);
}catch(err){
    console.log(err);
    e.target.setAttribute('action',null);
}
}

userListSubmitButton.addEventListener('click',getAction)




const makeUserGroupAdmin = async() => {
    try {
        const messageContainer = document.getElementById('chat-bubble-container');
        const groupId = messageContainer.getAttribute('data-id');
        const token = getToken();
        const response = await axios.get(domain+`/group/${groupId}/users`,{ headers: { Authorization: token }})
        const userList = response.data
        console.log(userList);
        const userListContainer = document.getElementById('userListContainer')
        userListContainer.innerHTML='';
        const userIdHolder = document.getElementById('selectedUserId')
        userList.map((e,i) =>{
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
        
        userListSubmitButton.setAttribute('action','adminUser');
        const userListModalButton = document.getElementById('userListModalButton')
        userListModalButton.click()
    console.log('modify usergroup.');
  } catch (err) {
    console.log(err);
    userListSubmitButton.setAttribute('action',null)
  }
};

const setRemoveUserEventListener = () => {
    const removeUserButtonS = document.getElementById('removeUserS');
const removeUserButtonL = document.getElementById('removeUserL');

removeUserButtonS.removeEventListener('click',getUserToRemoveFromGroup)
removeUserButtonL.removeEventListener('click',getUserToRemoveFromGroup)

    const screenWidth = window.innerWidth;
    let elementToUse;
    if(screenWidth<750){
        elementToUse = removeUserButtonS
    }
    else{
        elementToUse = removeUserButtonL
    }
    elementToUse.addEventListener('click', getUserToRemoveFromGroup);
}

const setMakeUserAdminEventListener = () => {

    const adminUserButtonS = document.getElementById('adminUserS');
    const adminUserButtonL = document.getElementById('adminUserL');
    
    
    
    
        const screenWidth = window.innerWidth;
        let elementToUse;
        if(screenWidth<750){
            elementToUse = adminUserButtonS
            adminUserButtonL.removeEventListener('click', makeUserGroupAdmin)
        }
        else{
            elementToUse = adminUserButtonL
            adminUserButtonS.removeEventListener('click', makeUserGroupAdmin)
        }
        elementToUse.addEventListener('click', makeUserGroupAdmin);
    }

const setUserModalEventListener = () => {
    const addUserButtonL = document.getElementById('addUserL');
    const addUserButtonS = document.getElementById('addUserS');

    const screenWidth = window.innerWidth;
    let elementToUse;
    if(screenWidth<750){
        elementToUse = addUserButtonS;
        addUserButtonL.removeEventListener('click',setAndCallGroupModal)
    }
    else{
        elementToUse = addUserButtonL
        addUserButtonS.removeEventListener('click',setAndCallGroupModal)
    }
    elementToUse.addEventListener('click', setAndCallUserModal);
}

const onWindowRefreshAndResize = () => {
    setRemoveUserEventListener();
    setMakeUserAdminEventListener();
    setUserModalEventListener();
    SetcreateAndLeaveGroupEventListeners();
}

window.addEventListener('DOMContentLoaded',onWindowRefreshAndResize)
window.addEventListener('resize',onWindowRefreshAndResize)