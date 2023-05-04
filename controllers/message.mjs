
import { createMessage } from '../services/message.mjs';

export const addMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const message = req.body.message;
    await createMessage({ userId, message });
    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.log(err);
  }
};
