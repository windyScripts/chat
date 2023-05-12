
import Sib from 'sib-api-v3-sdk';

const { ApiClient, TransactionalEmailsApi } = Sib;

export const sendEmail = async function(sender, receiver, subject, textContent, htmlContent, params) {
  const client = ApiClient.instance;
  const apiKey = client.authentications['api-key'];
  apiKey.apiKey = process.env.SIB_SMTP_API_KEY;
  if (!client) return new Promise((resolve, reject) => reject('Invalid client'));

  const transactionalEmailApi = new TransactionalEmailsApi();
  try {
    return new Promise((resolve, reject) => {
      transactionalEmailApi.sendTransacEmail({
        sender,
        to: receiver,
        subject,
        textContent,
        htmlContent,
        params,
      }).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};
