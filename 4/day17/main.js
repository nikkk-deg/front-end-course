import { realpathSync } from "fs";
import { UI_EL, PERMANENTS } from "./vies.js";
// import { get } from "http";

const sendMesToServer = (message) => {
    const socket = new WebSocket(`wss://edu.strada.one/websockets?${getCookie('code')}`);
    socket.onopen = ()=> socket.send(JSON.stringify({ text: message}));
    console.log('принял смс');
    socket.onmessage = function(event) {renderMessageFromHistory(JSON.parse(event.data))};
}


// logout from chat

const logoutFromAcc = () => {
    saveCodeInCookie('code', '');
    saveCodeInCookie('email','');
    change_name_in_chat('');
    console.log(document.cookie);
}

UI_EL.LOGOUT_BUTTON.addEventListener('click', logoutFromAcc);


// change name in chat
const change_name_in_chat = (name) =>  UI_EL.NAME_IN_CHAT.textContent = name;



// send email
const postData =async (mail_address) => {
    const data = {
        email: `${mail_address}`
    }
    const response = await fetch(PERMANENTS.API_GET_CODE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data)
    })
    return response.json(); 
}


const sendMail = (event) => {
    event.preventDefault();
    if(UI_EL.MAIL.value){
        postData(UI_EL.MAIL.value);
        saveCodeInCookie("email", UI_EL.MAIL.value);
        UI_EL.MAIL.value = "";
    }
}

UI_EL.MAIL_FORM.addEventListener('submit', sendMail);



const sendMessage = (event) => {
    event.preventDefault();
    sendMesToServer(UI_EL.MESSAGE_TEXT.value);
    UI_EL.MESSAGE_TEXT.value = "";
}

UI_EL.SEND_MESSAGE.addEventListener("submit", sendMessage);

// save code from mail in cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

const saveCodeInCookie = (name, value) =>{
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
}

// login in chat
const getUser = async (token) => {
    const response = await fetch(PERMANENTS.API_GET_NAME, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
        },
    });
    const valueRequest = await response.json();
    change_name_in_chat(valueRequest.name);
}

const login = event => {
    event.preventDefault();
    console.log(document.cookie);
    getUser(UI_EL.CODE_FROM_EMAIL.value);
    saveCodeInCookie("code", UI_EL.CODE_FROM_EMAIL.value);
    UI_EL.CODE_FROM_EMAIL.value = "";
}

UI_EL.LOGIN_IN_CHAT.addEventListener('submit', login);


// change name in settings

const getName = async (token, userName) => {
    const user = {
        'name': userName,
    }
    const response = await fetch(PERMANENTS.API_CHANGE_NAME, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    })
    const valueRequest = await response.json();
    console.log(valueRequest);
    change_name_in_chat(valueRequest.name);
    return valueRequest;
}


const changeName = (event) => {
    event.preventDefault();
    getName(getCookie('code'), UI_EL.NEW_NAME.value);
    UI_EL.NEW_NAME.value = "";
}

UI_EL.CHANGE_NAME.addEventListener('submit', changeName);


// render history of messages

const getHistoreOfMessages = async (token) => {
    const response = await fetch(PERMANENTS.API_GET_MESSAGES, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
        },
    });
    const valueRequest = await response.json();
    return valueRequest;
}

const createMessageFromHistory = (message)=> {
    const templateContent = UI_EL.TEMPLATE_MESSAGE.content.cloneNode(true);
    const templateRoot = document.createElement('div');
    const textOfMessage = templateContent.querySelector('.text');
    const userName = templateContent.querySelector('.userName');
    userName.textContent = message.user.name;
    textOfMessage.textContent = message.text;
    if(message.text.length < 10){
        templateRoot.style.maxWidth = "max-content";
    }
    if(message.user.email == getCookie('email')){
        templateRoot.className = UI_EL.MY_MESS_CLASS;
    }else{
        templateRoot.className = UI_EL.USER_MESSAGE_CLASS;
    }
    const timeOfMessage = templateContent.querySelector('.time');
    timeOfMessage.textContent = message.createdAt.substr(11,5);       
    templateRoot.append(templateContent);
    return templateRoot;    
}

const renderMessageFromHistory = (message) => {
    UI_EL.CHAT.append(createMessageFromHistory(message));
    const space = document.createElement('div');
    space.className = UI_EL.SPACE_CLASS;
    UI_EL.CHAT.append(space);
    UI_EL.CHAT_PARENT.scrollTop =  UI_EL.CHAT_PARENT.scrollHeight;
    
}




const renderMessagesFromHistory = async () => {
    let messagesArray = [];
    let messageHistory = await getHistoreOfMessages(getCookie('code'));
    messageHistory.messages.slice().reverse().forEach((item)=>{
        messagesArray.push(item);
    })
    return(messagesArray);
}

const renderMess = async (number) =>{
    let arr = await renderMessagesFromHistory();
    for(let i=number; i<number+10; i++){
        renderMessageFromHistory(arr[i]);
        arr.shift();
    }
}

let number = 10;

// const renderTwentyMess = () => {
//     renderMess(number);
//     number+=20;
// }

function checkPosition() {
    // Нам потребуется знать высоту документа и высоту экрана:
    const height = document.body.offsetHeight
    const screenHeight = window.innerHeight
  
    // Они могут отличаться: если на странице много контента,
    // высота документа будет больше высоты экрана (отсюда и скролл).
  
    // Записываем, сколько пикселей пользователь уже проскроллил:
    const scrolled = window.scrollY
  
    // Обозначим порог, по приближении к которому
    // будем вызывать какое-то действие.
    // В нашем случае — четверть экрана до конца страницы:
    const threshold = height - screenHeight / 4
  
    // Отслеживаем, где находится низ экрана относительно страницы:
    const position = scrolled + screenHeight
  
    if (position >= threshold) {
      // Если мы пересекли полосу-порог, вызываем нужное действие.
    }
  }
  

UI_EL.CHAT_PARENT.addEventListener('scroll', checkPosition);


// first render
const firstRender = () => {
    getUser(getCookie('code'));
    renderMess(0);
    // renderMessagesFromHistory();
}

firstRender();
