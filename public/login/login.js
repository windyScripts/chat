/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const form = document.querySelector('#form');
const emailField = document.querySelector('#email');
const passwordField = document.querySelector('#password');
const signUpButton = document.querySelector('#toSignUp');
const feedback = document.querySelector('#failMessage');
const forgotPasswordButton = document.querySelector('#toForgotEmail');

form.addEventListener('submit', validateLogin);

async function validateLogin(e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
  } else {
    feedback.textContent = '';

    const entry = {
      password: passwordField.value,
      email: emailField.value,
    };
    try {
      const response = await axios.post(domain + '/auth/login', entry);
      feedback.textContent = 'Login success!';
      const token = response.data.token;
      localStorage.setItem('token', token);
      window.location.href = '../chat/chat.html';
    } catch (err) {
      feedback.textContent = err.response.data.message;
    }
  }
}

signUpButton.addEventListener('click', signUpRedirect);

function signUpRedirect() {
  window.location.href = '../signup/signup.html';
}

forgotPasswordButton.addEventListener('click', forgotPasswordRedirect);

function forgotPasswordRedirect() {
  window.location.href = '../forgot-password/forgot-password.html';
}

