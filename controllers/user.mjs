import { createUser , findOneUser } from '../services/user.mjs';
import bcrypt from 'bcrypt'

function invalid(...params) {
    for (let i = 0; i < params.length; i++) {
      if (params[i].length < 1 || params[i] == undefined) return true;
    }
    return false;
  }

export const addUser = async (req,res) => {
    const checkInvalid = invalid(req.body.userName, req.body.email, req.body.password);
    const existingUser = Boolean(await findOneUser({where:{email:req.body.email}}))
    if (checkInvalid===true) {
        return res.status(401).json({ message: 'Invalid details.' });
      }
      else if(existingUser===true){
        return res.status(401).json({ message: 'User already exists.' });
      }
try{
    const saltRounds = 10;
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      const response = await createUser({ name: req.body.userName, email: req.body.email, password: hash , phone:req.body.phone});
      return res.status(200).json(response);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: 'Something went wrong'})
  }
};
