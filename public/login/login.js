/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const getEmailAndPassword = () => {
  const emailField = document.querySelector('#email');
  const passwordField = document.querySelector('#password');
  return [passwordField.value, emailField.value];
};

const form = document.querySelector('#form');
const validateLogin = async e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
  } else {
    const feedback = document.querySelector('#failMessage');
    feedback.textContent = '';
    const [password, email] = getEmailAndPassword();
    const entry = {
      password, email,
    };
    try {
      const response = await axios.post(domain + '/auth/login', entry);
      feedback.textContent = 'Login success!';
      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('email',email);
      window.location.href = '../chat/chat.html';
    } catch (err) {
      console.log(err);

      feedback.textContent = err.response.data.message;
    }
  }
};
form.addEventListener('submit', validateLogin);

const signUpRedirect = () => {
  window.location.href = '../signup/signup.html';
};
const signUpButton = document.querySelector('#toSignUp');
signUpButton.addEventListener('click', signUpRedirect);

const forgotPasswordRedirect = () => {
  window.location.href = '../forgot-password/forgot-password.html';
};
const forgotPasswordButton = document.querySelector('#toForgotEmail');
forgotPasswordButton.addEventListener('click', forgotPasswordRedirect);
