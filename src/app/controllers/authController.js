const { response } = require('express');
const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

function generateToken(params = {}){
    return token = jwt.sign(params, authConfig.secret,{
        expiresIn: 3600
    });
}


router.post('/signup', async(req, res)=>{
    const {email} = req.body;

    try{
        if(await User.findOne({email}))
            return res.status(400).send({error: 'User already exists'});


        const user = await User.create(req.body);
        
        user.password = undefined;

        return res.send({user, token: generateToken({id: user._id, name: "teste"})});
        
    } catch(err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/signin', async(req, res)=>{
    const {email, password} = req.body;
       
    try{
        const user = await User.findOne({email}).select('+password');

       if(!user)
        return res.status(400).send({error: 'User not found'});

        if(!await bcrypt.compare(password, user.password))
            return res.status(400).send({error: 'Invalid password'});

        user.password = undefined;

        res.send({
            user, 
            token: generateToken({id: user._id})
        });
    }catch(error){
        res.send(error);
    }  
});

router.post('/forgot_password', async (req, res)=>{
    const {email} = req.body;

    try{
        const user = await User.findOne({email});

        if(!user)
        return res.status(400).send({error: 'User not found'});

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
           '$set':{
               passwordResetToken: token,
               passwordResetExpires: now
           } 
        });

       mailer.sendMail({
         to: email,
         from: 'informe-seu-email',
         template : 'auth/forgot_password',
         context: {token},
         subject: 'Redefinir Senha'
       }).then(message =>{
           console.log(message);
           res.send();
       }).catch(err =>{
           console.log(err);
       });

    }catch(err){
        res.status(400).send({error: 'Erro on forgot password, try again'});
    }
})

router.post('/reset_password', async(req, res) =>{
    const {email, token, password} = req.body;

    try{
        const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');

        if(!user)
            return res.status(400).send({error: 'User not found'});

        if(token !== user.passwordResetToken)
            return res.status(400).send({error: 'Token invalid'});

        const now = new Date();
        if(now > user.passwordResetExpires)
            return res.status(400).send({error: 'Token expired, genered a new one'});

        user.password = password;

        await user.save();

        res.send();

    }catch(err){
        res.status(400).send({error: 'Cannot reset password, try again'});
    }
})

router.get('/users', async (req, res) => {
    try{
        const users = await User.find();

        res.send(users);
    }catch(error){
        res.send(error);
    }
});

module.exports = server => server.use('/auth', router);
