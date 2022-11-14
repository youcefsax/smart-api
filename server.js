import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt-nodejs";
import cors from "cors";
import knex from "knex";
import Clarifai from 'clarifai';
const ap= new Clarifai.App({
    apiKey:'9f51d1145f91438cbef964281e803477'
    });
    const handallApi=(req,res)=>{
        ap.models.predict(Clarifai.FACE_DETECT_MODEL,req.body.input);
    }
    
    
const db= knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', //localhost
      user : '', //add your user name for the database here
      port: 5432, // add your port number here
      password : '', //add your correct password in here
      database : 'braindb' //add your database name you created here
    }
});

const app=express();

app.use(bodyParser.json());
app.use(cors());
const database={
    users: [
        {
            id:"123",
            name:"hamou",
            email:"bendahmaneyoucef@gmail.com",
            password:"hahay",
            entr:"0",
            joind:new Date()
        },
        {
            id:"453",
            name:"adou",
            email:"bendahmanesaxo@gmail.com",
            password:"hihay",
            entr:"1",
            joind:new Date()
        }
    ]
}


app.post('/signin',(req,res)=>{
    const {email,name,password}=req.body;
    if(!email || !password){
        return res.status(400).json('not valid information')
    }
   db.select('email', 'hash').from('login').where('email','=',req.body.email)
   .then(data=>{
    const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
    if(isValid){
       return db.select('*').from('users').where('email',"=",req.body.email)
        .then(user=>{

            res.json(user[0])
        })
        .catch(err=>res.status(400).json('you cannot get a user'))
    }else{
        res.status(400).json('invalid')
    }
   }).catch(err=>res.status(400).json('invalid'))
 
});
app.post('/register',(req,res)=>{
    const {email,name,password}=req.body;
    if(!email || !name || !password){
        return res.status(400).json('not valid information')
    }
    const hash=bcrypt.hashSync(password);
    db.transaction(trx=>{
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=>{
            trx('users').returning('*').insert({
                email:email,
                name:name,
                joind:new Date()
              }).then(response=>res.json(response[0]))
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
  .catch(err=>res.status(400).json('you cannot'));  
  
    
});

app.get('/profile/:id',(req,res)=>{
    const { id }=req.params;
    db.select('*').from('users').where({id:id}).then(user=>{
        if(user.length)
        {res.json(user[0])
        }else{
            res.status(400).json('not existe')
        }
    })
        .catch(err=>res.status(400).json('not existe'));
//     database.users.forEach(user => {
//         if(user.id===id){
//             found=true;
//             return res.json(user);
//         }
        
        
        
//     });
//     if(!found){res.status(400).json('not existe');}
});
app.put('/image',(req,res)=>{
    const { id }=req.body;
   db('users').where('id','=',id).
   increment('entries',1).returning('entries').then(data=>res.json(data[0])).catch(err=>res.status(400).json('unable to count'));
});


 // Load hash from your password DB.

app.listen(process.env.PORT, ()=>{
    console.log('shut');
});
