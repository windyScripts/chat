/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const form = document.querySelector('#form');
const feedback = document.querySelector('#feedback');

// login details

const getSignUpDetails = () => {
  const userNameField = document.querySelector('#name');
  const emailField = document.querySelector('#email');
  const passwordField = document.querySelector('#password');
  const phoneNumberField = document.querySelector('#phone');

  return [userNameField.value, emailField.value, passwordField.value, phoneNumberField.value];
};

const clearSignUpFields = () => {
  const userNameField = document.querySelector('#name');
  const emailField = document.querySelector('#email');
  const passwordField = document.querySelector('#password');
  const phoneNumberField = document.querySelector('#phone');

  userNameField.value = '';
  passwordField.value = '';
  emailField.value = '';
  phoneNumberField.value = '';
};

// login redirect

const toLoginButton = document.querySelector('#toLogin');
toLoginButton.addEventListener('click', loginRedirect);

function loginRedirect() {
  window.location.href = '../login/login.html';
}

// frontend validation and handling response

form.addEventListener('submit', validateAndSubmitForm);

async function validateAndSubmitForm(e) {
  e.preventDefault();
  try {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
    } else {
      const [userName, email, password, phone] = getSignUpDetails();
      const entry = {
        userName,
        password,
        email,
        phone,
      };
      await axios.post(domain + '/auth/new', entry);
      clearSignUpFields();
      feedback.textContent = 'Success!';
    }
  } catch (err) {
    console.log(err);
    feedback.textContent = err.response.data.message;
  }
}
