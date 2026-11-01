const express = require("express");
const jsonwteboken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs")
const path = require("path")


const app = express();
const PORT = 3000;
const JWT_SECRET = "надзвичайно-дуже-секретний-пароль12320012010" 
const COOKIE_NAME = "token"

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(_dirtname,"public")));

const users = [];

const cookieOptions = {
    httpOnly: true,
    sameSite:"strict",
    maxAge: 60*60*1000
}

function createToken(user){
    return JWT_sign(
        {id: user.id, username: user.username},
        JWT_SECRET,
        {expiresIn: "1h",}
    );
}


function requireAuth(req,res,next){
    const token = req.cookie[COOKIE_NAME];
    if(!token){
        return res.status(401).json({error:"Потрібно увійти"});
    }try{
        req.user = jwt.verify(token,JWT_SECRET);
        next();
    } catch{
        res.clearCookie(COOKIE_NAME);
        res.status(401).json({error:"Сесія закінчилась"});
    }
}

app.post("/api/register", async (req,res) => {
    const{username,password} = req.body;
    if(!username || !password || password.lenght < 6){
        return res.status(401).json({error:"login and password from 6 characters"})
    } if(users.find(u => u.username === username)){
        return res.status(409).json({error:"Login already exits"})
    }
    const passwordHash = await bcryptjs.hash(password,10);
    const user = {id: Date.now().toString(),username,passwordHash};
    users.push(user);

    res.cookie(COOKIE_NAME,createToken(user), cookieOptions);
    res.status(200).json({username})
});