const message = document.getElementById("message");
const profile = document.getElementById("profile");

function getUserData() {
    return {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
}

// Реєстрація
async function register() {
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(getUserData())
        });

        const data = await response.json();

        message.textContent = data.message || data.error;
        profile.textContent = "";

    } catch (error) {
        message.textContent = "Помилка з'єднання із сервером";
    }
}

// Авторизація
async function login() {
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(getUserData())
        });

        const data = await response.json();

        message.textContent = data.message || data.error;
        profile.textContent = "";

    } catch (error) {
        message.textContent = "Помилка з'єднання із сервером";
    }
}

// Перевірка профілю
async function getProfile() {
    try {
        const response = await fetch("/api/profile", {
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = data.message;
            profile.textContent =
                "Користувач: " + data.user.username;
        } else {
            message.textContent = data.error;
            profile.textContent = "";
        }

    } catch (error) {
        message.textContent = "Помилка з'єднання із сервером";
    }
}

// Вихід
async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        message.textContent = data.message;
        profile.textContent = "";

    } catch (error) {
        message.textContent = "Помилка з'єднання із сервером";
    }
}