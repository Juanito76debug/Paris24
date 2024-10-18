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
          const messageCountElem = document.getElementById("messageCount");
          if (messageCountElem) {
            messageCountElem.textContent = data.count;
          }
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
          const onlineUserCountElem =
            document.getElementById("onlineUserCount");
          if (onlineUserCountElem) {
            onlineUserCountElem.textContent = data.count;
          }
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

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);

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
const errorMessagesLogin = document.getElementById("errorMessagesLogin"); //Erreur si les données ne sont pas valides.

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Login failed");
          });
        }
        return response.json();
      })
      // affichage de l'utilisateur vers la page de profil.
      .then((data) => {
        if (data.success) {
          alert("Connexion réussie!");
          window.location.href = "profile.html";
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
  // Vérification du mormulaire de réinitialisation du mot de passe
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const errorMessagesForgotPassword = document.getElementById(
    "errorMessagesForgotPassword"
  );
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;

      if (!forgotPasswordForm.checkValidity()) {
        event.stopPropagation();
        forgotPasswordForm.classList.add("was-validated");
        return;
      }
      fetch("http://localhost:3000/api/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.message || "Password reset failed");
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert("Email de réinitialisation du mot de passe envoyé!");
          } else {
            errorMessagesForgotPassword.style.display = "block";
            errorMessagesForgotPassword.innerHTML = (data.errors || [])
              .map((error) => `<p>${error.msg}</p>`)
              .join("");
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la réinitialisation du mot de passe :",
            error
          );
          alert(
            "Erreur lors de la réinitialisation du mot de passe : " +
              error.message
          );
        });
    });
  }

  function getUserType() {
    const userType = localStorage.getItem("userType");
    return userType || "visitor";
  }
}
