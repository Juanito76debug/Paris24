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

    fetchMessageCount();
    fetchOnlineUsersCount();
    setInterval(fetchMessageCount, 5000);
    setInterval(fetchOnlineUsersCount, 5000);
  });

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
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

  // Formulaire de connexion pour l'utilisateur
  const loginForm = document.getElementById("loginForm");
  const errorMessagesLogin = document.getElementById("errorMessagesLogin");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        .then((data) => {
          if (data.success) {
            alert("Connexion réussie!");
            window.location.href = "profil.html";
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

  // Vérification du formulaire de réinitialisation du mot de passe
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const errorMessagesForgotPassword = document.getElementById(
    "errorMessagesForgotPassword"
  );

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("forgotEmail").value;

      if (!forgotPasswordForm.checkValidity()) {
        event.stopPropagation();
        forgotPasswordForm.classList.add("was-validated");
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:3000/api/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Password reset failed");
        }

        if (data.success) {
          alert("Email de réinitialisation du mot de passe envoyé!");
        } else {
          errorMessagesForgotPassword.style.display = "block";
          errorMessagesForgotPassword.innerHTML = (data.errors || [])
            .map((error) => `<p>${error.msg}</p>`)
            .join("");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la réinitialisation du mot de passe :",
          error
        );
        alert(
          "Erreur lors de la réinitialisation du mot de passe : " +
            error.message
        );
      }
    });
  }

  // Formulaire de déconnexion
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      window.location.href = "index.html";
    });
  }

  // Vérifier le type d'utilisateur et charger les données pertinentes
  function checkUserType() {
    const userType = localStorage.getItem("userType");
    const logoutNavItem = document.getElementById("logoutNavItem");

    if (userType === "member" || userType === "admin") {
      logoutNavItem.classList.remove("d-none");
    }

    if (userType === "admin") {
      loadAdminProfile();
      loadUsers();
    }
  }

  // Fonction pour charger le profil de l'administrateur
  document.addEventListener("DOMContentLoaded", () => {
    function loadAdminProfile() {
      fetch("http://localhost:3000/api/profil", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Problème pour obtenir un profil");
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("adminUsername").textContent = data.username;
          document.getElementById("adminFullName").value = data.fullName;
          document.getElementById("adminAge").value = data.age;
          document.getElementById("adminGender").value = data.gender;
          document.getElementById("adminEmail").value = data.email;
          document.getElementById("adminPhone").value = data.contact;
          document.getElementById("adminBio").value = data.bio;
          document.getElementById("adminPreferences").value = data.preferences;
          if (data.profilePicture) {
            document.querySelector("img[alt='Photo de profil']").src =
              data.profilePicture;
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération du profil :", error);
          alert("Erreur lors de la récupération du profil : " + error.message);
        });
    }

    // Gestionnaire d'evenement pour modifier le profil de l'administrateur
    document
      .getElementById("AdminProfileForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const payload = Object.fromEntries(formData.entries());
        payload.Age = 48; //modification de l'age
        payload.Phone = "0123456789"; //modification du téléphone
        payload.preferences = "adore le foot"; // modification de la préférence
        try {
          const response = await fetch("http://localhost:3000/api/profil", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (response.ok) {
            alert("Profil mis à jour réussie");
            loadAdminProfile();
          } else {
            alert("Erreur lors de la mise à jour du profil : " + data.message);
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour du profil :", error);
          alert("Erreur lors de la mise à jour du profil : " + error.message);
        }
      });

    // Fonction pour charger les utilisateurs
    async function loadUsers() {
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Problème pour obtenir les utilisateurs");
        }

        const data = await response.json();
        const usersTableBody = document.getElementById("usersTableBody");
        if (usersTableBody) {
          usersTableBody.innerHTML = "";
          data.forEach((user) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td><button onclick="viewFriendProfile(${user.id})">Voir le profil de l'ami</button></td>
            <td><button>Modifier</button></td>
            <td><button>Supprimer</button></td>
          `;
            usersTableBody.appendChild(row);
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs :",
          error
        );
        alert(
          "Erreur lors de la récupération des utilisateurs : " + error.message
        );
      }
    }

    // Mise à jour du profil de l'administrateur en modale
    const editProfileForm = document.getElementById("editProfileForm");

    editProfileForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(editProfileForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        const response = await fetch("http://localhost:3000/api/profil", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Profil mis à jour avec succès !");
          // Mise à jour des informations modifiées sur la page
          document.getElementById("adminAge").value = payload.age;
          document.getElementbyId("adminPhone").value = payload.phone;
          document.getElementById("adminPreferences").value =
            payload.preferences;
          //fermeture de la modale
          const editProfileModal = new bootstrap.Modal(
            document.getElementById("editProfileModal")
          );
          editProfileModal.hide();
          // rechargement du profil après mise à jour
        } else {
          alert("Erreur lors de la mise à jour du profil : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        alert("Erreur lors de la mise à jour du profil : " + error.message);
      }
    });

    // Fonction pour voir le profil d'un ami de l'administrateur
    window.viewFriendProfile = async function (userId) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Problème pour obtenir le profil de l'ami");
        }

        const data = await response.json();
        document.getElementById("friendProfileSection").style.display = "block";
        document.getElementById("friendUsername").innerText = data.username;
        document.getElementById("friendFullName").innerText = data.fullName;
        document.getElementById("friendAge").innerText = data.age;
        document.getElementById("friendGender").innerText = data.gender;
        document.getElementById("friendEmail").innerText = data.email;
        document.getElementById("friendPhone").innerText = data.contact;
        document.getElementById("friendBio").innerText = data.bio;
        document.getElementById("friendPreferences").innerText =
          data.preferences;
        if (data.profilePicture) {
          document.querySelector("img[alt='Photo de profil']").src =
            data.profilePicture;
        }
      } catch (error) {
        console.error("Erreur pour récupérer le profil de l'ami : ", error);
        alert("Erreur pour récupérer le profil de l'ami : " + error.message);
      }
    };

    // Fonction pour modifier le profil de l'ami de l'administrateur
    window.editFriendProfile = async function (userId) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Problème pour obtenir le profil de l'ami");
        }
        const data = await response.json();
        document.getElementById("FriendProfileSection").style.display = "block";
        document.getElementById("FriendUsername").value = data.username;
        document.getElementById("FriendFullName").value = data.fullName;
        document.getElementById("FriendAge").value = data.age;
        document.getElementById("FriendGender").value = data.gender;
        document.getElementById("FriendEmail").value = data.email;
        document.getElementById("FriendPhone").value = data.contact;
        document.getElementById("FriendBio").value = data.bio;
        document.getElementById("FriendPreferences").value = data.preferences;
        document.getElementById("friendProfileForm").onsubmit = async function (
          event
        ) {
          event.preventDefault();
          const formData = new FormData(
            document.getElementById("friendProfileForm")
          );
          const payload = Object.fromEntries(formData.entries());
          try {
            const response = await fetch(
              `http://localhost:3000/api/users/${userId}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
              }
            );
            const updateData = await response.json();
            if (response.ok) {
              alert("Profil de l'ami réussie!");
              loadUsers();
            } else {
              alert(
                "Erreur lors de la mise à jour du profil de l'ami : " +
                  updateData.message
              );
            }
          } catch (error) {
            console.error(
              "Erreur lors de la mise à jour du profil de l'ami : ",

              error
            );
            alert(
              "Erreur lors de la mise à jour du profil de l'ami : " +
                error.message
            );
          }
        };
      } catch (error) {
        console.error("Erreur pour récupérer le profil de l'ami : ", error);
      }
    };

    // Gestionnaire d'événements pour le bouton de confirmation de suppression
    document
      .getElementById("confirmDeleteProfile")
      .addEventListener("click", async function () {
        try {
          const response = await fetch("http://localhost:3000/api/profil", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            alert("Profil supprimé avec succès!");
            localStorage.removeItem("token");
            window.location.href = "/register.html";
          } else {
            alert("Erreur lors de la suppression du profil : " + data.message);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression du profil : ", error);
          alert("Erreur lors de la suppression du profil : " + error.message);
        }
      });

    // Gestionnaire d'événements pour le bouton d'annulation de suppression
    document
      .querySelector("#deleteProfileSection .btn-secondary")
      .addEventListener("click", function () {
        hideDeleteProfileSection();
      });

    // Charger le profil lors du chargement de la page
    loadAdminProfile();

    // Vérifier le type d'utilisateur (facultatif, selon vos besoins)
    checkUserType();
  });
};
