window.onload = function () {
  // Accueil - voir le nombre de messages publiés en temps réel
  document.addEventListener("DOMContentLoaded", function () {
    function fetchMessageCount() {
      fetch("http://localhost:3000/api/messageCount")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch message count");
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("messageCount").textContent = data.count;
        })
        .catch((error) => {
          console.error("Error fetching message count:", error);
        });
    }

    // Accueil- voir le nombre de membres connectés en temps réel
    function fetchOnlineUsersCount() {
      fetch("http://localhost:3000/api/online")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch online users count");
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("onlineUserCount").textContent = data.count;
        })
        .catch((error) => {
          console.error(
            "Problème avec le nombre d'utilisateurs en ligne :",
            error
          );
        });
    }

    // nombre de messages + nombre de membres connectés en temps réel tous les 5 secondes
    fetchMessageCount();
    fetchOnlineUsersCount();
    setInterval(fetchMessageCount, 5000);
    setInterval(fetchOnlineUsersCount, 5000);
  });
};

// Formulaire d'inscription pour l'utilisateur
const registerForm = document.getElementById("registerForm");
const errorMessages = document.getElementById("errorMessages");

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }), // Correction ici
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Registration failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Inscription réussie !");
          window.location.href = "login.html";
        } else {
          errorMessages.style.display = "block";
          errorMessages.innerHTML = (data.errors || [])
            .map((error) => `<p>${error.msg}</p>`)
            .join("");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement :", error);
        alert("Erreur lors de l'enregistrement : " + error.message);
      });
  });
}

// formulaire de connexion pour l'utilisateur
const loginForm = document.getElementById("loginForm");
const errorMessagesLogin = document.getElementById("errorMessagesLogin");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Login failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Connexion réussie!");
          window.location.href = "index.html";
        } else {
          errorMessagesLogin.style.display = "block";
          errorMessagesLogin.innerHTML = (data.errors || [])
            .map((error) => `<p>${error.msg}</p>`)
            .join("");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la connexion :", error);
        alert("Erreur lors de la connexion : " + error.message);
      });
  });
}
