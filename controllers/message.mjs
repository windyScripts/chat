import { createMessage, findAllMessages } from '../services/message.mjs';

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

export const getMessages = async (req,res) => {
    try{
        const response =  await findAllMessages()
        console.log(response);
        return res.status(200).json({response, id:req.user.id})
    }catch(err){
        console.log(err);
    }
}