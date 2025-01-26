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
  document.addEventListener("DOMContentLoaded", function () {
    const adminProfileForm = document.getElementById("adminProfileForm");
    if (adminProfileForm) {
      adminProfileForm.addEventListener("submit", async (event) => {
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

  // Fonction pour chargement et affichage de la liste d'amis de l'administrateur
  document.addEventListener("DOMContentLoaded", function () {
    const friendsList = document.getElementById("friendsList");
    // Fonction pour chargement et affichage des demandes d'amis
    const friendRequestsList = document.getElementById("friendRequestsList");

    async function loadFriends() {
      try {
        const response = await fetch("http://localhost:3000/api/friends", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.warn("Problème pour obtenir la liste des amis");
          alert(
            "Problème pour obtenir la liste d'amis. Veuillez réessayer plus tard "
          );
          return;
        }
        const data = await response.json();
        friendsList.innerHTML = "";
        friendRequestsList.innerHTML = "";

        if (Array.isArray(data.friends)) {
          data.friends.forEach((friend) => {
            const friendItem = document.createElement("div");
            friendItem.classList.add("col-md-4");
            friendItem.innerHTML = `
          <div class="card mb-4">
            <img class="card-img-top" alt="Photo de profil" src="${
              friend.profilePictureUrl || "assets/Edouard.png"
            }">
            <img class="card-img-top" alt="Photo de profil" src="${
              friend.profilePictureUrl || "assets/Rose.png"
            }">
            <div class="card-body">
            <h5 class="card-title">${friend.username}</h5>
            <p class="card-text">${friend.fullName}</p>
            ${
              friend.status === "confirmé"
                ? `
            <button class="btn btn-danger btn-sm deleteFriendBtn" data-friend-id="${friend._id}">Supprimer</button>
            `
                : `
            <button class="btn btn-primary btn-sm acceptFriendRequestBtn" data-friend-id="${friend._id}">Accepter l'invitation</button>
            <button class="btn btn-primary btn-sm ignoreFriendRequestBtn" data-friend-id="${friend._id}">Ignorer l'invitation</button>
            `
            }
            </div>
            </div>
            `;
            if (friend.status === "confirmé") {
              friendsList.appendChild(friendItem);
            } else {
              friendRequestsList.appendChild(friendItem);
            }
          });

          // Gestionnaire d'événements pour les boutons de suppression de la liste d'amis de l'administrateur
          document.querySelectorAll(".deleteFriendBtn").forEach((button) => {
            button.addEventListener("click", async function () {
              const friendId = this.getAttribute("data-friend-id");
              if (confirm("Etes vous certain de supprimer cet ami?")) {
                try {
                  const response = await fetch(
                    `http://localhost:3000/api/friends/${friendId}`,
                    {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const data = await response.json();
                  if (response.ok) {
                    // Message de confirmation
                    const successMessage = document.getElementById(
                      "friendRemovedMessage"
                    );
                    successMessage.classList.remove("d-none");
                    setTimeout(() => {
                      successMessage.classList.add("d-none");
                    }, 3000);
                    alert("Ami supprimé avec succès");
                    loadFriends();
                  } else {
                    alert(
                      "Erreur lors de la suppression de l'ami : " + data.message
                    );
                  }
                } catch (error) {
                  console.error(
                    "Erreur lors de la suppression de l'ami : ",
                    error
                  );
                  alert(
                    "Erreur lors de la suppression de l'ami : " + error.message
                  );
                }
              }
            });
          });
        } else {
          alert("Erreur lors de la récupération des amis : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des amis :", error);
        alert("Erreur lors de la récupération des amis : " + error.message);
      }
    }

    loadFriends();
  });

  // Gestionnaire d'événement suite aux liens de la liste d'amis afin de charger les détails de l'administrateur
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".friend-link").forEach((link) => {
      link.addEventListener("click", async function (event) {
        event.preventDefault();
        const friendId = this.getAttribute("data-friend-id");
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/${friendId}`
          );
          const data = await response.json();
          if (response.ok) {
            document.getElementById("adminUsername").textContent =
              data.profile.username;
            document.getElementById("adminFullName").value =
              data.profile.fullName;
          } else {
            alert(
              "Erreur lors de la récupération des détails de l'administrateur: " +
                data.message
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des détails de l'administrateur : ",
            error
          );
          alert(
            "Erreur lors de la récupération des détails de l'administrateur : " +
              error.message
          );
        }
      });
    });
    // Gestionnaire d'événements pour bouton d'envoi afin d'inviter un ami
    document.querySelectorAll(".sendFriendRequestBtn").forEach((button) => {
      button.addEventListener("click", async function (event) {
        const friendId = this.getAttribute("data-friend-id");
        try {
          const response = await fetch(
            `http://localhost:3000/api/friends/invite`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ friendId }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            // Confirmation du message
            const successMessage = document.getElementById(
              "friendRequestSuccessMessage"
            );
            successMessage.classList.remove("d-none");
            setTimeout(() => {
              successMessage.classList.add("d-none");
            }, 3000);
          } else {
            alert(
              "Erreur lors de l'envoi de la demande d'invitation : " +
                data.message
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de l'envoi de la demande d'invitation : ",
            error
          );
          alert(
            "Erreur lors de l'envoi de la demande d'invitation : " +
              error.message
          );
        }
      });
    });
  });
  // Gestionnaire d'événements pour que l'invitation de l'ami soit acceptée, ignorer et supprimer
  document.querySelectorAll(".acceptFriendRequestBtn").forEach((button) => {
    button.addEventListener("click", async function () {
      const friendId = this.getAttribute("data-friend-id");
      if (!friendId || friendId === "ID_DU_MEMBRE") {
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/api/friends/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendId }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          // Message de confirmation acceptée
          const successMessage = document.getElementById(
            "friendRequestAcceptedMessage"
          );
          successMessage.classList.remove("d-none");
          setTimeout(() => {
            successMessage.classList.add("d-none");
          }, 3000);
          loadFriends();
        } else {
          alert(
            "Erreur lors de l'acceptation de la demande d'invitation : " +
              data.message
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'acceptation de la demande d'invitation : ",
          error
        );
        alert(
          "Erreur lors de l'acceptation de la demande d'invitation : " +
            error.message
        );
      }
    });
  });

  // ignorer la demande d'amis
  document.querySelectorAll(".ignoreFriendRequestBtn").forEach((button) => {
    button.addEventListener("click", async function () {
      const friendId = this.getAttribute("data-friend-id");
      if (!friendId || friendId === "ID_DU_MEMBRE") {
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/api/friends/ignore`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendId }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          // Message de confirmation pour ignorer la demande d'ajout
          const ignoredMessage = document.getElementById(
            "friendRequestIgnoredMessage"
          );
          ignoredMessage.classList.remove("d-none");
          setTimeout(() => {
            ignoredMessage.classList.add("d-none");
          }, 3000);
          loadFriends();
        } else {
          alert(
            "Erreur lors de l'ignoration de la demande d'invitation : " +
              data.message
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'ignoration de la demande d'invitation : ",
          error
        );
        alert(
          "Erreur lors de l'ignoration de la demande d'invitation : " +
            error.message
        );
      }
    });
  });

  //Fonction pour chargement des amis confirmés et MAJ de la liste de sélection
  document.addEventListener("DomContentLoaded", function () {
    const confirmedFriendDropdown = document.getElementById(
      "confirmedFriendDropdown"
    );
    const confirmedFriendDropdownMenu = document.getElementById(
      "confirmedFriendDropdownMenu"
    );
    //Fonction pour gérer un ami a recommandé
    const recommendFriendButton = document.getElementById(
      "recommendFriendButton"
    );
    // Fonction pour afficher le message de confirmation après recommandation de l'ami
    const recommendationMessage = document.getElementById(
      "recommendationMessage"
    );
    let selectedFriendId = null;

    async function loadConfirmedFriends() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/confirmedfriends",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          console.warn("Problème pour obtenir la confirmation d'ami");
          alert(
            "Problème pour obtenir la confirmation d'ami. Veuillez réessayer plus tard."
          );
          return;
        }
        const data = await response.json();
        confirmedFriendDropdownMenu.innerHTML = "";

        if (Array.isArray(data.friends)) {
          data.friends.forEach((friend) => {
            const li = document.createElement("li");
            li.innerHTML = `<a class="dropdown-item" href="#" data-friend-id="${friend._id}"><img src="${friend.photo}" class="inline-image" alt="Photo de ${friend.username}"> ${friend.username}</a>`;
            confirmedFriendDropdownMenu.appendChild(li);
          });

          // Ajout d'un exemple d'ami
          const exampleLi = document.createElement("li");
          exampleLi.innerHTML = `<a class="dropdown-item" href="#" data-friend-id="exampleId"><img src="assets/Jose.png" class="inline-image" alt="Photo de Jose"> Jose</a>`;
          confirmedFriendDropdownMenu.appendChild(exampleLi);
          confirmedFriendDropdownMenu
            .querySelectorAll(".dropdown-item")
            .forEach((item) => {
              item.addEventListener("click", function (event) {
                event.preventDefault();
                selectedFriendId = this.getAttribute("data-friend-id");
                const friendPhoto = this.getAttribute("data-friend-photo");
                confirmedFriendDropdown.textContent = this.textContent;
                selectedFriendId.innerHTML = `<img src="${friendPhoto}" class="img-fluid" alt="Photo de l'ami séléctionné">`;
              });
            });
        } else {
          console.error("Les données reçues ne sont pas un tableau:", data);
          alert(
            "Erreur lors de la récupération des confirmations d'amis. Veuillez réessayer plus tard."
          );
        }
      } catch {
        console.error(
          "Erreur lors de la récupération des confirmations d'amis : ",
          error
        );
        alert(
          "Erreur lors de la récupération des confirmations d'amis. Veuillez réessayer plus tard."
        );
      }
    }
    recommendFriendButton.addEventListener("click", async function () {
      const selectedFriendId = confirmedFriendsSelect.value;
      const recommenderId = "EdouardId";

      if (!selectedFriendId) {
        alert("Veuillez sélectionner un ami pour recommander");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/api/recommendFriend`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendId: selectedFriendId, recommenderId }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          recommendationMessage.textContent = "Recommandation envoyée Réussie";
          recommendationMessage.classList.remove("d-none");
          setTimeout(() => {
            recommendationMessage.classList.add("d-none");
          }, 3000);
        } else {
          alert("Erreur lors de la recommandation de l'ami : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la recommandation de l'ami : ", error);
        alert("Erreur lors de la recommandation de l'ami : " + error.message);
      }
    });

    loadConfirmedFriends();
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

    // fonction pour chargement et affichage de la liste d'amis sur le profil de l'ami.
    document.addEventListener("DOMContentLoaded", function () {
      const friendFriendsList = document.getElementById("friendFriendsList");

      async function loadFriendFriends(friendId) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/friends/${friendId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            console.warn("Problème pour obtenir la liste des amis");
            alert(
              "Problème pour obtenir la liste des amis. Veuillez réessayer plus tard."
            );
            return;
          }
          const data = await response.json();
          friendFriendsList.innerHTML = "";
          if (Array.isArray(data.friends)) {
            data.friends.forEach((friend) => {
              const friendItem = document.createElement("div");
              friendItem.classList.add = "col-md-4";
              friendItem.innerHTML = `
            <div class="card mb-4">
            <img class="card-img-top" alt="Photo de profil" src="${friend.username}">
              <h5 class="card-title">${friend.username}</h5>
              <p class="card-text">${friend.fullName}</p>
              </div>
              </div>
              `;
              friendFriendsList.appendChild(friendItem);
            });
          } else {
            console.error("Les données reçues ne sont pas un tableau");
            alert(
              "Erreur lors de la récupération des amis. Veuillez réessayer plus tard."
            );
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des amis : ", error);
          alert(
            "Erreur lors de la récupération des amis. Veuillez réessayer plus tard."
          );
        }
      }
      loadFriendFriends();
    });

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
          "Erreur lors de la publication du message. Veuillez réessayer plus tard."
        );
      }
    });
  }

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
      if (messagesList) {
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
                <button class="btn btn-danger btn-sm mt-2 deleteMessageBtn" data-message-id="${message._id}">Supprimer</button>
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
                    form
                      .closest(".list-group-item")
                      .querySelector(".repliesList")
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
                  "Erreur lors de la publication de la réponse : " +
                    error.message
                );
              }
            });
          });

          // Gestionnaire d'événements pour supprimer le message sur le profil de l'administrateur
          document.querySelectorAll(".deleteMessageBtn").forEach((button) => {
            button.addEventListener("click", async function () {
              const messageId = this.getAttribute("data-message-id");
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
                    alert(
                      "Erreur lors de la suppression du message: " +
                        data.message
                    );
                  }
                } catch (error) {
                  console.error(
                    "Erreur lors de la suppression du message : ",
                    error
                  );
                  alert(
                    "Erreur lors de la suppression du message : " +
                      error.message
                  );
                }
              }
            });
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages : ", error);
      alert(
        "Erreur lors de la récupération des messages. Veuillez réessayer plus tard."
      );
    }
  }

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
      if (repliesList) {
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
      if (friendMessagesList) {
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
                  "Erreur lors de la publication de la réponse : " +
                    error.message
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
                      "Erreur lors de la suppression du message : " +
                        data.message
                    );
                  }
                } catch (error) {
                  console.error(
                    "Erreur lors de la suppression du message : ",
                    error
                  );
                  alert(
                    "Erreur lors de la suppression du message : " +
                      error.message
                  );
                }
              }
            });
          });
        }
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

// Formulaire pour publier un message sur tous les profils

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
      if (allProfilesMessagesList) {
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
        }

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

// Fonction pour chargement et affichage de la liste d'amis de tous les profils.
document.addEventListener("DOMContentLoaded", function () {
  const allUserFriendsList = document.getElementById("allUserFriendsList");

  async function loadAllUserFriends() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/allUsersFriends",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.warn("Problème pour obtenir les amis");
        alert("Problème pour obtenir les amis. Veuillez réessayer plus tard.");
        return;
      }
      const data = await response.json();

      // Vérification si l'élément existe avant modification de son innerHTML
      if (allUserFriendsList) {
        allUserFriendsList.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((friend) => {
            const friendItem = document.createElement("div");
            friendItem.classList.add("col-md-4");
            friendItem.innerHTML = `
              <div class="card mb-4">
                <img class="card-img-top" alt="Photo de profil" src="${friend.username}">
                <h5 class="card-title">${friend.username}</h5>
                <p class="card-text">${friend.fullName}</p>
                <button class="btn btn-danger btn-sm deleteAllUsersFriendbtn" data-friend-id="${friend.id}">Supprimer</button>
              </div>
            `;
            allUserFriendsList.appendChild(friendItem);
          });

          // Gestionnaire d'événements pour les boutons de suppressions de la liste d'amis dans tous les profils
          document
            .querySelectorAll(".deleteAllUsersFriendbtn")
            .forEach((button) => {
              button.addEventListener("click", async function () {
                const friendId = this.getAttribute("data-friend-id");
                if (
                  confirm(
                    "Etes-vous certain de vouloir supprimer cet ami de tous les profils?"
                  )
                ) {
                  try {
                    const response = await fetch(
                      `http://localhost:3000/api/allUsersFriends/${friendId}`,
                      {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    const data = await response.json();
                    if (response.ok) {
                      alert("Suppression de l'ami réussie!");
                      loadAllUserFriends();
                    } else {
                      alert(
                        "Erreur lors de la suppression de l'ami : " +
                          data.message
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Erreur lors de la suppression de l'ami : ",
                      error
                    );
                    alert(
                      "Erreur lors de la suppression de l'ami : " +
                        error.message
                    );
                  }
                }
              });
            });
        } else {
          console.error("Les données reçues ne sont pas un tableau :", data);
          alert(
            "Erreur lors de la récupération des amis. Veuillez réessayer plus tard."
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des amis : ", error);
      alert(
        "Erreur lors de la récupération des amis. Veuillez réessayer plus tard."
      );
    }
  }

  loadAllUserFriends();
});

// Fonction pour gérer les sujets de discussion privée avec plusieurs amis de l'administrateur et suppression.

document.addEventListener("DOMContentLoaded", function () {
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const chatWindow = document.getElementById("chatWindow");
  const deleteDiscussionBtn = document.getElementById("deleteDiscussionBtn");

  if (messageForm) {
    messageForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = messageInput.value.trim();
      if (!message) {
        alert("Veuillez saisir un message.");
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            recipients: ["Rafa", "Jose"],
          }),
        });
        const data = await response.json();
        if (response.ok) {
          messageInput.value = "";
          loadMessages();
        } else {
          alert("Erreur lors de l'envoi du message privé : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi du message privé : ", error);
        alert("Erreur lors de l'envoi du message privé : " + error.message);
      }
    });
  }

  // Suppression de la discussion privé ouvert par l'administrateur
  if (deleteDiscussionBtn) {
    deleteDiscussionBtn.addEventListener("click", async function () {
      if (
        confirm(
          "Etes-vous certain de vouloir supprimer cette discussion privée?"
        )
      ) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/deleteDiscussion",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recipients: ["Rafa", "Jose"],
              }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            alert("Suppression de la discussion privée réussie!");
            chatWindow.innerHTML = "";
          } else {
            alert(
              "Erreur lors de la suppression de la discussion privée : " +
                data.message
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de la discussion privée : ",
            error
          );
          alert(
            "Erreur lors de la suppression de la discussion privée : " +
              error.message
          );
        }
      }
    });
  }

  async function loadMessages() {
    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.warn("Problème pour obtenir les messages privés");
        alert(
          "Problème pour obtenir les messages privés. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();
      if (chatWindow) {
        chatWindow.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((message) => {
            const messageItem = document.createElement("div");
            messageItem.classList.add("message-item");
            messageItem.innerHTML = `<p>${message.content}</p>
          <small class="text-muted">${new Date(
            message.createdAt
          ).toLocaleString()}</small>`;
            chatWindow.appendChild(messageItem);
          });
        } else {
          console.error("Les données reçues ne sont pas un tableau :", data);
          alert(
            "Erreur lors de la récupération des messages privés. Veuillez réessayer plus tard."
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des messages privés : ",
        error
      );
      alert(
        "Erreur lors de la récupération des messages privés. Veuillez réessayer plus tard."
      );
    }
  }

  loadMessages();
});

// Fonction pour gérer les sujets de discussion privée avec tous les profils et suppression

document.addEventListener("DOMContentLoaded", function () {
  const allmessageForm = document.getElementById("allmessagesForm");
  const allmessageInput = document.getElementById("allmessageInput");
  const adminChatWindow = document.getElementById("adminChatWindow");
  const allUsersList = document.getElementById("allUsersList");
  const alldeleteDiscussionBtn = document.getElementById(
    "alldeleteDiscussionBtn"
  );

  if (allmessageForm) {
    allmessageForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = allmessageInput.value.trim();
      if (!message) {
        alert("Veuillez saisir un message.");
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
            body: JSON.stringify({
              content: message,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          allmessageInput.value = "";
          loadAllMessages();
        } else {
          alert("Erreur lors de l'envoi du message public : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi du message public : ", error);
        alert("Erreur lors de l'envoi du message public : " + error.message);
      }
    });
  }

  // Suppression de la discussion publique ouverte par l'administrateur sur tous les profils
  if (alldeleteDiscussionBtn) {
    alldeleteDiscussionBtn.addEventListener("click", async function () {
      if (confirm("Êtes-vous certain de supprimer cette discussion?")) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/alldeleteDiscussion",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            alert("Suppression de la discussion publique réussie!");
            adminChatWindow.innerHTML = "";
          } else {
            alert(
              "Erreur lors de la suppression de la discussion publique : " +
                data.message
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de la discussion publique : ",
            error
          );
          alert(
            "Erreur lors de la suppression de la discussion publique : " +
              error.message
          );
        }
      }
    });
  }

  async function loadAllMessages() {
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
        console.warn("Problème pour obtenir les messages publics");
        alert(
          "Problème pour obtenir les messages publics. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();

      if (adminChatWindow) {
        adminChatWindow.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((message) => {
            const messageItem = document.createElement("div");
            messageItem.classList.add("message-item");
            messageItem.innerHTML = `<p>${message.content}</p>
          <small class="text-muted">${new Date(
            message.createdAt
          ).toLocaleString()}</small>`;
            adminChatWindow.appendChild(messageItem);
          });
        } else {
          console.error("Les données reçues ne sont pas un tableau");
          alert(
            "Erreur lors de la récupération des messages publics. Veuillez réessayer plus tard."
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des messages publics : ",
        error
      );
      alert(
        "Erreur lors de la récupération des messages publics. Veuillez réessayer plus tard."
      );
    }
  }

  async function loadAllUsers() {
    try {
      const response = await fetch("http://localhost:3000/api/Users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.warn("Problème pour obtenir la liste des utilisateurs");
        alert(
          "Problème pour obtenir la liste des utilisateurs. Veuillez réessayer plus tard."
        );
        return;
      }
      const data = await response.json();
      if (allUsersList) {
        allUsersList.innerHTML = "";

        if (Array.isArray(data)) {
          data.forEach((user) => {
            const userItem = document.createElement("div");
            userItem.classList.add("list-group-item");
            userItem.innerHTML = `<p>${user.username}</p>`;
            allUsersList.appendChild(userItem);
          });
        } else {
          console.error("Les données reçues ne sont pas un tableau :", data);
          alert(
            "Erreur lors de la récupération de la liste des utilisateurs. Veuillez réessayer plus tard."
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la liste des utilisateurs : ",
        error
      );
      alert(
        "Erreur lors de la récupération de la liste des utilisateurs. Veuillez réessayer plus tard."
      );
    }
  }

  loadAllUsers();
  loadAllMessages();
});
