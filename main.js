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
    document.getElementById("playerNameLabel").innerHTML = "Add another player:"

    let playerName = document.getElementById("playerName");
    playerName.removeAttribute("placeholder");
    let name = playerName.value;
    if (players[name] != undefined) {
        let playerExists = document.getElementById("playerExists");
        playerExists.style.display = "block";
        playerExists.innerHTML = "player already exists!";
        return false;
    }
    players[name] = 0;

    let entry = document.createElement("li");
    entry.appendChild(document.createTextNode(name));
    
    let list = document.getElementById("playerList");
    list.appendChild(entry);
    
    playerName.value = "";

    /* for (let [k, v] of Object.entries(players)) {
        console.log(`${k}: ${v}`);
    } */


}

document.getElementById("playerName").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addPlayer").click();
    } else if (playerExists.style.display != "none") {
        playerExists.style.display = "none";
    }
})

document.getElementById("playerName").addEventListener("click", function(){
    let playerName = document.getElementById("playerName");
    playerName.focus();
    playerName.select();
})