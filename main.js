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
        focusElement(document.getElementById("playerName"));
    } else {
        document.getElementById("gameChoice").style.display = "block";
    }
}

function focusElement(element) {
    element.focus();
    element.select();
}

function initGame() {
    document.getElementById("gameScreen").style.display = "block";
}

document.getElementById("newGame").addEventListener("click", function(){
    document.getElementById("gameChoice").style.display = "none"
    document.getElementById("addPlayers").style.display = "block"
    initGame();
})

document.getElementById("continueGame").addEventListener("click", function(){
    document.getElementById("gameChoice").style.display = "none"
    initGame();
})

document.getElementById("addPlayer").addEventListener("click", function(){
    let playerName = document.getElementById("playerName");
    let name = playerName.value;

    if (name.trim() == "") {
        focusElement(playerName); 
        return;
    }
    
    document.getElementById("playerNameLabel").innerHTML = "Add another player:"
    playerName.removeAttribute("placeholder");
    

    if (players[name] != undefined) {
        playerName.focus();
        playerName.select();

        let playerExists = document.getElementById("playerExists");
        playerExists.style.display = "block";
        playerExists.innerHTML = "player already exists!";
        return false;
    }

    players[name] = {};
    players[name]["score"] = 0;
    players[name]["position"] = Object.keys(players).length;
    
    playerName.value = "";
    focusElement(playerName);

    document.getElementById("doneAddPlayer").disabled = false;
})

document.getElementById("playerName").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addPlayer").click();
        return;
    }
    let playerExists = document.getElementById("playerExists");
    if (playerExists.style.display != "none") {
        playerExists.style.display = "none";
    }
})

document.getElementById("playerName").addEventListener("click", function(){
    focusElement(this);
})

document.getElementById("doneAddPlayer").addEventListener("click", function(){
    document.getElementById("addPlayers").style.display = "none";
    initGame();
})

document.getElementById("playerScore").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addScore").click();
        return;
    }
    let scoreInvalid = document.getElementById("scoreInvalid");
    if (scoreInvalid.style.display != "none") {
        scoreInvalid.style.display != "block";
    }
})