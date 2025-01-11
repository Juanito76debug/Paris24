window.onload = function () {
  // Accueil - Voir le nombre de messages publiés en temps réel
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
            alert("Inscription réussie!");
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
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Connexion réussie!");
          window.location.href = "profil.html";
        } else {
          errorMessagesLogin.style.display = "block";
          errorMessagesLogin.innerHTML = (data.errors || [])
            .map((error) => `<p>${error.msg}</p>`)
            .join("");
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        alert("Erreur lors de la connexion : " + error.message);
      }
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
  function loadAdminProfile() {
    fetch("http://localhost:3000/api/profil", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

  // Gestionnaire d'événement pour modifier le profil de l'administrateur
  document.addEventListener("DOMContentLoaded", loadAdminProfile);
  document
    .getElementById("adminProfileForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const payload = Object.fromEntries(formData.entries());
      payload.Age = 48; // Modification de l'âge
      payload.Phone = "0123456789"; // Modification du téléphone
      payload.preferences = "adore le foot"; // Modification de la préférence
      try {
        const response = await fetch("http://localhost:3000/api/profil", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Profil mis à jour réussi");
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
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      alert(
        "Erreur lors de la récupération des utilisateurs : " + error.message
      );
    }
  }

  // Fonction pour voir le profil d'un ami de l'administrateur
  window.viewFriendProfile = async function (userId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
      document.getElementById("friendPreferences").innerText = data.preferences;
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
          },
        }
      );
      if (!response.ok) {
        throw new Error("Problème pour obtenir le profil de l'ami");
      }
      const data = await response.json();
      document
        .getElementById("editFriendProfileSection")
        .classList.add("editFriendProfile");
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
              },
              body: JSON.stringify(payload),
            }
          );
          const updateData = await response.json();
          if (response.ok) {
            alert("Profil de l'ami mis à jour avec succès!");
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

  // Fonction pour supprimer le profil de l'ami de l'administrateur
  window.onload = function () {
    window.deleteFriendProfile = async function (userId) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Problème pour supprimer le profil de l'ami");
        }
        alert("Suppression du profil de l'ami réussie");
        document
          .getElementById("editFriendProfileSection")
          .classList.remove("editFriendProfile");
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du profil de l'ami : ",
          error
        );
        alert(
          "Erreur lors de la suppression du profil de l'ami : " + error.message
        );
      }
    };

    // Gestionnaire d'événements pour le bouton de modification de profil de l'administrateur
    const editProfileButton = document.getElementById("editProfileButton");
    if (editProfileButton) {
      editProfileButton.addEventListener("click", function () {
        alert("Profil modifié dans les champs fournis");
      });
    }

    // Gestionnaire d'événements pour affichage de la suppression du profil
    const deleteProfileButton = document.getElementById("deleteProfileButton");
    if (deleteProfileButton) {
      deleteProfileButton.addEventListener("click", function () {
        document
          .getElementById("deleteProfileSection")
          .classList.remove("d-none");
      });
    }
  };

  // Gestionnaire d'événements pour le bouton de confirmation de suppression
  window.onload = function () {
    // Fonction pour supprimer le profil de l'ami de l'administrateur
    window.deleteFriendProfile = async function (userId) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Problème pour supprimer le profil de l'ami");
        }
        alert("Suppression du profil de l'ami réussie");
        document
          .getElementById("editFriendProfileSection")
          .classList.remove("editFriendProfile");
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du profil de l'ami : ",
          error
        );
        alert(
          "Erreur lors de la suppression du profil de l'ami : " + error.message
        );
      }
    };

    // Gestionnaire d'événements pour le bouton de modification de profil de l'administrateur
    const editProfileButton = document.getElementById("editProfileButton");
    if (editProfileButton) {
      editProfileButton.addEventListener("click", function () {
        alert("Profil modifié dans les champs fournis");
      });
    }

    // Gestionnaire d'événements pour affichage de la suppression du profil
    const deleteProfileButton = document.getElementById("deleteProfileButton");
    if (deleteProfileButton) {
      deleteProfileButton.addEventListener("click", function () {
        document
          .getElementById("deleteProfileSection")
          .classList.remove("d-none");
      });
    }

    // Gestionnaire d'événements pour le bouton de confirmation de suppression
    const confirmDeleteProfile = document.getElementById(
      "confirmDeleteProfile"
    );
    if (confirmDeleteProfile) {
      confirmDeleteProfile.addEventListener("click", async function () {
        try {
          const response = await fetch("http://localhost:3000/api/profil", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (response.ok) {
            alert("Profil supprimé avec succès!");
            window.location.href = "/register.html";
          } else {
            alert("Erreur lors de la suppression du profil : " + data.message);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression du profil : ", error);
          alert("Erreur lors de la suppression du profil : " + error.message);
        }
      });
    }

    // Gestionnaire d'événements pour le bouton d'annulation de suppression
    const cancelDeleteProfile = document.getElementById("cancelDeleteProfile");
    if (cancelDeleteProfile) {
      cancelDeleteProfile.addEventListener("click", function () {
        document.getElementById("deleteProfileSection").classList.add("d-none");
      });
    }

    // Charger le profil lors du chargement de la page
    loadAdminProfile();

    // Vérifier le type d'utilisateur (facultatif, selon vos besoins)
    checkUserType();
  };
};

document.addEventListener("DOMContentLoaded", function () {
  // Gestionnaire d'événements pour modifier tous les profils de l'administrateur
  const editAllProfileSection = document.getElementById(
    "editAllProfileSection"
  );
  if (editAllProfileSection) {
    editAllProfileSection.addEventListener("click", async function () {
      alert("Tous les profils modifiés");
    });
  }

  // Gestionnaire d'événements pour affichage de la suppression de tous les profils de l'administrateur
  const deleteAllProfileSection = document.getElementById(
    "deleteAllProfileSection"
  );
  if (deleteAllProfileSection) {
    deleteAllProfileSection.addEventListener("click", function () {
      deleteAllProfileSection.classList.remove("d-none");
    });
  }

  // Gestionnaire d'événements pour le bouton de confirmation de suppression de tous les profils
  const confirmDeleteAllProfiles = document.getElementById(
    "confirmDeleteAllProfiles"
  );
  if (confirmDeleteAllProfiles) {
    confirmDeleteAllProfiles.addEventListener("click", async function () {
      try {
        const response = await fetch("http://localhost:3000/api/profiles", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          alert("Tous les profils supprimés avec succès!");
          deleteAllProfileSection.classList.add("d-none");
        } else {
          alert(
            "Erreur lors de la suppression de tous les profils : " +
              data.message
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de tous les profils : ",
          error
        );
        alert(
          "Erreur lors de la suppression de tous les profils : " + error.message
        );
      }
    });
  }

  // Formulaire pour publier un message sur le profil de l'administrateur
  document.addEventListener("DOMContentLoaded", function () {
    const postMessageForm = document.getElementById("postMessageForm");
    const messagesList = document.getElementById("messagesList");

    if (postMessageForm) {
      postMessageForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(postMessageForm);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.message.trim()) {
          alert("Veuillez entrer un message");
          return;
        }

        try {
          const response = await fetch("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (response.ok) {
            alert("Message réussie!");
            postMessageForm.reset();
            loadMessages();
          } else {
            alert("Erreur lors de la publication du message : " + data.message);
          }
        } catch (error) {
          console.error("Erreur lors de la publication du message : ", error);
          alert(
            "Erreur lors de la publication du message. Veuillez réessayer."
          );
        }
      });
    }
  });

  async function loadMessages() {
    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Problème pour obtenir les messages");
        alert(
          "Problème pour obtenir les messages. Veuillez réessayer plus tard."
        );
        return;
      }

      const data = await response.json();
      messagesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((message) => {
          const messageItem = document.createElement("div");
          messageItem.classList.add("list-group-item");
          messageItem.innerHTML = `
              <p>${message.content}</p>
              <small class="text-muted"></small>
              <div class="mt-3">
                <form class="replyForm" data-message-id="${message._id}">
                  <div class="mb-3">
                    <textarea class="form-control" name="reply" rows="3" placeholder="Répondre..."></textarea>
                  </div>
                  <button class="btn btn-primary btn-sm">Répondre</button>
                </form>
                <div class="repliesList mt-3"></div>
                <button class="btn btn danger btn-sm-mt-2 deleteMessageBtn" data-message-id="${message._id}">Supprimer</button>
              </div>
            `;
          messagesList.appendChild(messageItem);

          // Chargement des réponses pour ce message
          loadReplies(message._id, messageItem.querySelector(".repliesList"));
        });

        // Gestionnaire d'événements pour les formulaires de réponse sur le profil de l'administrateur
        document.querySelectorAll(".replyForm").forEach((form) => {
          form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const form = event.target;
            const messageId = form.getAttribute("data-message-id");
            if (!messageId) {
              alert("ID de message non valide");
              return;
            }
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            if (!payload.reply.trim()) {
              alert("Veuillez répondre au message");
              return;
            }

            try {
              const response = await fetch(
                `http://localhost:3000/api/messages/${messageId}/replies`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content: payload.reply }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                alert("Réponse Réussie!");
                form.reset();
                loadReplies(
                  messageId,
                  form.closest(".list-group-item").querySelector(".repliesList")
                );
              } else {
                alert(
                  "Erreur lors de la publication de la réponse : " +
                    data.message
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la publication de la réponse : ",
                error
              );
              alert(
                "Erreur lors de la publication de la réponse : " + error.message
              );
            }
          });
        });
      } else {
        console.error("Les données reçues ne sont pas un tableau :", data);
        alert(
          "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages : ", error);
      alert(
        "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
      );
    }
  }

  // Gestionnaire d'événements pour supprimer le message sur le profil de l'administrateur
  document.querySelectorAll(".deleteMessageBtn").forEach((button) => {
    button.addEventListener("click", async function () {
      const messageId = this.getAttribute("data-messageId");
      if (confirm("Êtes-vous certain de supprimer ce message?")) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/messages/${messageId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();
          if (response.ok) {
            alert("Suppression du message réussie!");
            loadMessages();
          } else {
            alert("Erreur lors de la suppression du message: " + data.message);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression du message : ", error);
          alert("Erreur lors de la suppression du message : " + error.message);
        }
      }
    });
  });

  async function loadReplies(messageId, repliesList) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/messages/${messageId}/replies`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.warn("Problème pour obtenir les réponses");
        alert(
          "Problème pour obtenir les réponses. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();
      repliesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((reply) => {
          const replyItem = document.createElement("div");
          replyItem.classList.add("list-group-item");
          replyItem.innerHTML = `
              <p>${reply.content}</p>
              <small class="text-muted"></small>
            `;
          repliesList.appendChild(replyItem);
        });
      } else {
        console.error("Les données reçues ne sont pas un tableau :", data);
        alert(
          "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réponses : ", error);
      alert(
        "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
      );
    }
  }

  loadMessages();
});

// Formulaire pour publier un message sur le profil de l'ami

document.addEventListener("DOMContentLoaded", function () {
  const friendPostMessageForm = document.getElementById(
    "friendPostMessageForm"
  );
  const friendMessagesList = document.getElementById("friendMessagesList");

  if (friendPostMessageForm) {
    friendPostMessageForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(friendPostMessageForm);
      const payload = Object.fromEntries(formData.entries());
      if (!payload.message.trim()) {
        alert("Veuillez entrer un message");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/friendMessages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert("Message réussie!");
          friendPostMessageForm.reset();
          loadFriendMessages();
        } else {
          alert("Erreur lors de la publication du message : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la publication du message : ", error);
        alert("Erreur lors de la publication du message : " + error.message);
      }
    });
  }

  async function loadFriendMessages() {
    try {
      const response = await fetch("http://localhost:3000/api/friendMessages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Problème pour obtenir les messages");
        alert(
          "Problème pour obtenir les messages. Veuillez réessayer plus tard."
        );
        return;
      }

      const data = await response.json();
      friendMessagesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((message) => {
          const messageItem = document.createElement("div");
          messageItem.classList.add("list-group-item");
          messageItem.innerHTML = `
            <p>${message.content}</p>
            <small class="text-muted"></small>
            <div class="mt-3">
              <form class="friendReplyForm" data-message-id="${message._id}">
                <div class="mb-3">
                  <textarea class="form-control" name="reply" rows="3" placeholder="Répondre..."></textarea>
                </div>
                <button class="btn btn-primary btn-sm">Répondre</button>
              </form>
              <div class="friendRepliesList mt-3"></div>
              <button class="btn btn-danger btn-sm mt-2 deleteMessageBtn" data-message-id="${message._id}">Supprimer</button>
            </div>
          `;
          friendMessagesList.appendChild(messageItem);

          // Chargement des réponses pour ce message
          loadFriendReplies(
            message._id,
            messageItem.querySelector(".friendRepliesList")
          );
        });

        // Gestionnaire d'événements pour les formulaires de réponse sur le profil de l'ami
        document.querySelectorAll(".friendReplyForm").forEach((form) => {
          form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const form = event.target;
            const messageId = form.getAttribute("data-message-id");
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            if (!payload.reply.trim()) {
              alert("Veuillez répondre au message");
              return;
            }

            try {
              const response = await fetch(
                `http://localhost:3000/api/friendMessages/${messageId}/replies`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content: payload.reply }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                alert("Réponse Réussie!");
                form.reset();
                loadFriendReplies(
                  messageId,
                  form
                    .closest(".list-group-item")
                    .querySelector(".friendRepliesList")
                );
              } else {
                alert(
                  "Erreur lors de la publication de la réponse : " +
                    data.message
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la publication de la réponse : ",
                error
              );
              alert(
                "Erreur lors de la publication de la réponse : " + error.message
              );
            }
          });
        });

        // Gestionnaire d'événements pour supprimer le message sur le profil de l'ami
        document.querySelectorAll(".deleteMessageBtn").forEach((button) => {
          button.addEventListener("click", async function () {
            const messageId = this.getAttribute("data-message-id");
            if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
              try {
                const response = await fetch(
                  `http://localhost:3000/api/friendMessages/${messageId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                const data = await response.json();
                if (response.ok) {
                  alert("Suppression du message réussie!");
                  loadFriendMessages();
                } else {
                  alert(
                    "Erreur lors de la suppression du message : " + data.message
                  );
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la suppression du message : ",
                  error
                );
                alert(
                  "Erreur lors de la suppression du message : " + error.message
                );
              }
            }
          });
        });
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray(data.messages)
      ) {
        // Traiter les données comme un objet avec une propriété messages
        data.messages.forEach((message) => {
          const messageItem = document.createElement("div");
          messageItem.classList.add("list-group-item");
          messageItem.innerHTML = `
            <p>${message.content}</p>
            <small class="text-muted"></small>
            <div class="mt-3">
              <form class="friendReplyForm" data-message-id="${message._id}">
                <div class="mb-3">
                  <textarea class="form-control" name="reply" rows="3" placeholder="Répondre..."></textarea>
                </div>
                <button class="btn btn-primary btn-sm">Répondre</button>
              </form>
              <div class="friendRepliesList mt-3"></div>
              <button class="btn btn-danger btn-sm mt-2 deleteMessageBtn" data-message-id="${message._id}">Supprimer</button>
            </div>
          `;
          friendMessagesList.appendChild(messageItem);

          // Chargement des réponses pour ce message
          loadFriendReplies(
            message._id,
            messageItem.querySelector(".friendRepliesList")
          );
        });

        // Gestionnaire d'événements pour les formulaires de réponse sur le profil de l'ami
        document.querySelectorAll(".friendReplyForm").forEach((form) => {
          form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const form = event.target;
            const messageId = form.getAttribute("data-message-id");
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            if (!payload.reply.trim()) {
              alert("Veuillez répondre au message");
              return;
            }

            try {
              const response = await fetch(
                `http://localhost:3000/api/friendMessages/${messageId}/replies`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content: payload.reply }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                alert("Réponse Réussie!");
                form.reset();
                loadFriendReplies(
                  messageId,
                  form
                    .closest(".list-group-item")
                    .querySelector(".friendRepliesList")
                );
              } else {
                alert(
                  "Erreur lors de la publication de la réponse : " +
                    data.message
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la publication de la réponse : ",
                error
              );
              alert(
                "Erreur lors de la publication de la réponse : " + error.message
              );
            }
          });
        });

        // Gestionnaire d'événements pour supprimer le message sur le profil de l'ami
        document.querySelectorAll(".deleteMessageBtn").forEach((button) => {
          button.addEventListener("click", async function () {
            const messageId = this.getAttribute("data-message-id");
            if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
              try {
                const response = await fetch(
                  `http://localhost:3000/api/friendMessages/${messageId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                const data = await response.json();
                if (response.ok) {
                  alert("Suppression du message réussie!");
                  loadFriendMessages();
                } else {
                  alert(
                    "Erreur lors de la suppression du message : " + data.message
                  );
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la suppression du message : ",
                  error
                );
                alert(
                  "Erreur lors de la suppression du message : " + error.message
                );
              }
            }
          });
        });
      } else {
        console.error("Les données ne sont pas un tableau :", data);
        alert(
          "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages : ", error);
      alert(
        "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
      );
    }
  }

  async function loadFriendReplies(messageId, repliesList) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/friendMessages/${messageId}/replies`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.warn("Problème pour obtenir les réponses");
        alert(
          "Problème pour obtenir les réponses. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();
      repliesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((reply) => {
          const replyItem = document.createElement("div");
          replyItem.classList.add("list-group-item");
          replyItem.innerHTML = `
            <p>${reply.content}</p>
            <small class="text-muted"></small>
          `;
          repliesList.appendChild(replyItem);
        });
      } else {
        console.error("Les données reçues ne sont pas un tableau :", data);
        alert(
          "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réponses : ", error);
      alert(
        "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
      );
    }
  }

  loadFriendMessages();
});

document.addEventListener("DOMContentLoaded", function () {
  const postAllProfilesForm = document.getElementById("postAllProfilesForm");
  const allProfilesMessagesList = document.getElementById(
    "allProfilesMessagesList"
  );

  if (postAllProfilesForm) {
    postAllProfilesForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(postAllProfilesForm);
      const payload = Object.fromEntries(formData.entries());
      if (!payload.message.trim()) {
        alert("Veuillez entrer un message");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/postAllProfiles",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert("Message publié avec succès sur tous les profils !");
          postAllProfilesForm.reset();
          loadAllProfilesMessages();
        } else {
          alert("Erreur lors de la publication du message : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la publication du message : ", error);
        alert("Erreur lors de la publication du message : " + error.message);
      }
    });
  }

  async function loadAllProfilesMessages() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/allProfilesMessages",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Problème pour obtenir les messages");
        alert(
          "Problème pour obtenir les messages. Veuillez réessayer plus tard."
        );
        return;
      }

      const data = await response.json();
      allProfilesMessagesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((message) => {
          const messageItem = document.createElement("div");
          messageItem.classList.add("list-group-item");
          messageItem.innerHTML = `
            <p>${message.content}</p>
            <small class="text-muted"></small>
            <div class="mt-3">
              <form class="replyAllProfilesForm" data-message-id="${message._id}">
                <div class="mb-3">
                  <textarea class="form-control" name="reply" rows="3" placeholder="Répondre..."></textarea>
                </div>
                <button class="btn btn-primary btn-sm">Répondre</button>
              </form>
              <div class="repliesAllProfilesList mt-3"></div>
              <button class="btn btn danger btn-sm mt-2 deleteMessageBtn" data-message-id="${message._id}">Supprimer</button>
            </div>
          `;
          allProfilesMessagesList.appendChild(messageItem);

          // Chargement des réponses pour ce message
          loadAllProfilesReplies(
            message._id,
            messageItem.querySelector(".repliesAllProfilesList")
          );
        });

        // Gestionnaire d'événements pour les formulaires de réponse sur tous les profils
        document.querySelectorAll(".replyAllProfilesForm").forEach((form) => {
          form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const messageId = form.getAttribute("data-message-id");
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            if (!payload.reply.trim()) {
              alert("Veuillez répondre au message");
              return;
            }

            try {
              const response = await fetch(
                `http://localhost:3000/api/allProfilesMessages/${messageId}/replies`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content: payload.reply }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                alert("Réponse Réussie!");
                form.reset();
                loadAllProfilesReplies(
                  messageId,
                  form
                    .closest(".list-group-item")
                    .querySelector(".repliesAllProfilesList")
                );
              } else {
                alert(
                  "Erreur lors de la publication de la réponse : " +
                    data.message
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la publication de la réponse : ",
                error
              );
              alert(
                "Erreur lors de la publication de la réponse : " + error.message
              );
            }
          });
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages : ", error);
      alert(
        "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
      );
    }
  }

  // Gestionnaire d'evenements pour supprimer le message sur tous les profils
  document
    .querySelectorAll(".deleteAllProfilesMessageBtn")
    .forEach((button) => {
      button.addEventListener("click", async function () {
        const messageId = this.getAttribute("data-message-id");
        if (confirm("Êtes-vous certain de vouloir supprimer ce message ?")) {
          try {
            const response = await fetch(
              `http://localhost:3000/api/allProfilesMessages/${messageId}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const data = await response.json();
            if (response.ok) {
              alert("Suppression du message réussie!");
              loadAllProfilesMessages();
            } else {
              alert(
                "Erreur lors de la suppression du message : " + data.message
              );
            }
          } catch (error) {
            console.error("Erreur lors de la suppression du message : ", error);
            alert(
              "Erreur lors de la suppression du message : " + error.message
            );
          }
        }
      });
    });

  async function loadAllProfilesReplies(messageId, repliesList) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/allProfilesMessages/${messageId}/replies`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.warn("Problème pour obtenir les réponses");
        alert(
          "Problème pour obtenir les réponses. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();
      repliesList.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach((reply) => {
          const replyItem = document.createElement("div");
          replyItem.classList.add("list-group-item");
          replyItem.innerHTML = `
            <p>${reply.content}</p>
            <small class="text-muted"></small>
          `;
          repliesList.appendChild(replyItem);
        });
      } else {
        console.error("Les données reçues ne sont pas un tableau :", data);
        alert(
          "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réponses : ", error);
      alert(
        "Erreur lors de la récupération des réponses. Veuillez réessayer plus tard."
      );
    }
  }

  loadAllProfilesMessages();
});
