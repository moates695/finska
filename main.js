function checkPrevious() {
    let welcome = document.getElementById("welcome");
    if (typeof(Storage) === "undefined") {
        //welcome.innerHTML = "local storage not supported";
        alert("local storage not supported");
        return;
    }
    let players = localStorage.getItem("players");
    if (players == null) {
        welcome.innerHTML = "no previous data";
    }
}