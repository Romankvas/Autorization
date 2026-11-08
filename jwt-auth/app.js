
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 3000;

const JWT_SECRET = "надзвичайно-дуже-секретний-пароль12320012010";
const COOKIE_NAME = "token";

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

const users = [];

const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000
};

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}


function requireAuth(req, res, next) {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            error: "Потрібно увійти"
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.clearCookie(COOKIE_NAME);
        return res.status(401).json({
            error: "Сесія закінчилась"
        });
    }
}


app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password || password.length < 6) {
            return res.status(400).json({
                error: "Логін і пароль мають бути заповнені. Пароль мінімум 6 символів"
            });
        }

        if (users.find(u => u.username === username)) {
            return res.status(409).json({
                error: "Login already exists"
            });
        }

        const passwordHash = await bcryptjs.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            username,
            passwordHash
        };

        users.push(user);

        const token = createToken(user);

        res.cookie(COOKIE_NAME, token, cookieOptions);

        res.status(201).json({
            message: "Реєстрація успішна",
            username
        });

    } catch (error) {
        res.status(500).json({
            error: "Помилка сервера"
        });
    }
});


app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({
                error: "Неправильний логін або пароль"
            });
        }

        const passwordMatch = await bcryptjs.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Неправильний логін або пароль"
            });
        }

        const token = createToken(user);

        res.cookie(COOKIE_NAME, token, cookieOptions);

        res.json({
            message: "Вхід успішний",
            username
        });

    } catch (error) {
        res.status(500).json({
            error: "Помилка сервера"
        });
    }
});


app.get("/api/me", requireAuth, (req, res) => {
    res.json({
        username: req.user.username
    });
});


app.post("/api/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME); 
    res.json({ok: true});
    });



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
