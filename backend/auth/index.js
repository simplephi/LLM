const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});



function respondError422(res, next, text){
    res.status(422);
    const error = new Error(text);
    next(error);
}

router.post('/login', (req, res, next) =>{

    const result = Joi.validate(req.body, schema);
    console.log("=========================");

    if (result.error === null) {


            if(req.body.username != process.env.USER_USERNAME) {
                respondError422(res, next, "Username Salah");

            }else{

                var payload = null;
                payload =  {
                    
                    profile : {
                        nama : "Admin",
                        
                    }
                };
                

                bcrypt.compare(req.body.password, process.env.USER_PASSWORD).then((result) => {
                    // Jika client mengirimkan password yang benar

                    if(result){
                        jwt.sign(payload, process.env.TOKEN_SECRET, {
                            expiresIn: '24h'
                        }, (err, token) => {
                            if(err){
                                respondError422(res, next, "Kesalahan dlm pembuatan token");
                                
                            }else{
                                res.json({
                                    token
                                });
                            }
                        })
                    }else{
                        respondError422(res, next, "Password salah");
                       
                    }
                });


            }


    }else{
        respondError422(res, next, "Gagal Login Periksa kembali username atau password anda..!");
         
    }
});



module.exports = router;
