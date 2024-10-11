const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app= express();
const jwt =require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const PORT= 3000;

const salt = bcrypt.genSaltSync(10);
const secret ='cgcgctugvhvhbuhuhuggyg';

app.use(cors({
    credentials:true, 
    origin:'http://localhost:3001',
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

const uri = "mongodb+srv://raiprathmesh71:Aadityalock%4089@cluster0.qpydz.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0";


//mongoose.connect('mongodb+srv://raiprathmesh71:Aadityalock@89@cluster0.qpydz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
//mongoose.connect('mongodb+srv://raiprathmesh71:Aadityalock%4089@cluster0.qpydz.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0');
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error: ', err));

  //useNewUrlParser: true,   // Parses MongoDB connection strings properly
    //useUnifiedTopology: true // Opts into using the MongoDB driver's new connection management engine

app.post('/register', async (req,res)=>{
    const { username, password} = req.body;

    
    if (!username || !password) {
        return res.status(400).json('Please provide a username and password.');
    }

    try{
        const userDoc = await  User.create({
            username, 
            password:bcrypt.hashSync(password,salt),
        });
        console.log(`Received data: ${username}, ${password}`);
        //res.status(200).json({ message: 'Registration successful!' });
        res.json(userDoc);
    }catch(e){
        res.status(400).json(e);
    }
});

app.post('/login', async(req,res)=>{
    const{username, password}=req.body;
    const userDoc= await User.findOne({username});
    const passOK= bcrypt.compareSync(password, userDoc.password);
    if(passOK){
        jwt.sign({username, id:userDoc._id}, secret, {}, (err,token)=>{
            if(err)throw err;
            //res.cookie('token', token).json('OK');
            res.cookie('token', token, {
                httpOnly: true,  
                secure: false,   
                sameSite: 'Lax', 
                path: '/',
        }).json('OK');
    });
    }else{
        res.status(400).json({message: 'Invalid username or password'});
    }
});

app.get('/profile', (req,res)=>{
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    jwt.verify(token, secret, {}, (err,info)=>{
        if(err) return res.status(401).json({ message: 'Token is invalid' });//throw err;
        console.log('Token verified, user info:', info);
        res.json(info);
    });
    res.json(req.cookies);
});

app.post('/logout', (req,res)=>{
    res.cookie('token', '').json('ok');
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//`Server is running on http://localhost:${PORT}`