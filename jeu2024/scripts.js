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
