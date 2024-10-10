window.onload = function () {
  // Accueil - voir le nombre de messages publiés en temps réel
  document.addEventListener("DOMContentLoaded", function () {
    function fetchMessageCount() {
      fetch("api/messages/count")
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("messageCount").textContent = data.count;
        })
        .catch((error) =>
          console.error("Error fetching message count:", error)
        );
    }

    // Accueil- voir le nombre de membres connectés en temps réel
    function fetchOnlineUsersCount() {
      fetch("api/users/online")
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("onlineUserCount").textContent = data.count;
        })
        .catch((error) =>
          console.error(
            "Problème avec le nombre d'utilisateurs en ligne :",
            error
          )
        );
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

    fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Inscription avec succès !");
          window.location.href = "login.html";
        } else {
          errorMessages.style.display = "block";
          errorMessages.innerHTML = data.errors
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
