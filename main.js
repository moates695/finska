const saved = localStorage.getItem("players");
let players;
if (saved !== null) {
    players = JSON.parse(localStorage.getItem("players"));
} else {
    players = {};
}


function checkStorage() {
    if (typeof(Storage) === "undefined") {
        document.getElementById("noLocalStorage").style.display = "block";
        return;
    }
    if (saved === null) {
        document.getElementById("addPlayers").style.display = "block";
    } else {
        document.getElementById("gameChoice").style.display = "block";
    }
}

function newGame() {

}

function continueGame() {

}

function playGame() {

}

function validatePlayerName() {
    let name = document.getElementById("playerName").value;
    if (players.hasOwnProperty(name)) {
        window.alert("exists");
        document.getElementById("playerExists").innerHTML = "player already exists!";
        return false;
    }
    players.name = name;

    let entry = document.createElement("li");
    entry.appendChild(document.createTextNode(name));
    
    let list = document.getElementById("playerList");
    list.appendChild(entry);
    
}