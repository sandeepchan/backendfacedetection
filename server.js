 const express  =    require('express')
 const bodyParser= require('body-parser')
 const bcrypt =    require('bcryptjs')
 const cors = require('cors')
 var knex = require('knex')
 const db= knex ({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'sandeep',
      database : 'smartbrain'
    }
  });
db.select('*').from('users').then(data=> console.log(data))
 
 const app  = express()

 app.use(bodyParser.json())
 app.use(cors())
const database = {
    users: [
        {
            id: '123',
            name: 'sand',
            email: 'sa@gmail.com',
            password: 'sandy',
            
            entries: 0,
            joined: new Date()
        },
        {
            id: '13',
            name: 'san',
            email: 'ja@gmail.com',
            password: 'sd',
            
            entries: 0,
            joined: new Date()
        }
    ],
    login : [
        {
            id: '196',
            hash: ' ',
            email:'sos@gmail.com',

        }
    ]
}
 app.get('/', (req, res)=>
 {
      res.send(database.users)
 })
 app.post('/signin', (req, res)=>
 { 
    db.select('email', 'hash').from('login')
    .where('email', '=',  req.body.email)
    .then(data => 
        {
            const isValid=  bcrypt.compare(req.body.password, data[0].hash)
            console.log(isValid)
            if(isValid)
            {
                return db.select('*').from('users')
                .where('email', '=',  req.body.email)
                .then(user=>{
                    console.log(user);
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to find user'))
            } else{
                res.status(400).json('Wrong Credentials')
            }
           
        })
        .catch(err => res.status(400).json('wrong credentials'))
      
 })
 
 app.post("/register", (req, res)=>
 { 
     const {email, password, name} = req.body
     var salt = bcrypt.genSaltSync(10);
     var hash = bcrypt.hashSync(password, salt);
     db.transaction(trx =>
        {
            trx.insert({
                hash: hash,
                email: email
            }).into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                .returning('*')
                .insert({
                    email:loginEmail[0],
                    name: name,
                    joined: new Date()

                })
                .then(user=>
                    {
                        res.json(user[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.json(err))
    })
 app.get('/profile/:id', (req, res)=>
 {
     const {id} = req.params;
   
    db.select('*').from('users').where({id: id})
    .then(user =>
        {

        if(user.length) 
        {
            res.json(user[0])

        }
        else{
            res.status(400).json('not found')

        }
    }
        )
    .catch(err => res.status(400).json('err in user findin'))
       
 })
 app.put('/image',(req, res)=>
 {
    const {id} = req.body;
      db('users').where('id', '=', id )
      .increment('entries', 1)
      .returning('entries')
      .then(entries => 
        res.json(entries[0]))
        .catch(err=>    res.status(400).json('unable to get entries'))
        

       
 })

// Load hash from your password DB.
// bcrypt.compare("B4c0/\/", hash, function(err, res) {
//     // res === true
// });
// bcrypt.compare("not_bacon", hash, function(err, res) {
//     // res === false
// });
//  bcrypt.compare("B4c0/\/", hash).then((res) => {
//     // res === true
// });
 app.listen(3000, ()=>
 {
     console.log('server started')
 })