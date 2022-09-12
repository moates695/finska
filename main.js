// PREREQS /////////////////////////////////////////////////////////////////////

const saved = localStorage.getItem("players");
let players;
if (saved !== null) {
    players = JSON.parse(localStorage.getItem("players"));
} else {
    players = {};
}
let currPos = 0;

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

// HELPERS /////////////////////////////////////////////////////////////////////

function focusElement(element, clear=false) {
    element.focus();
    element.select();
    if (clear) {
        console.log("here222");
        element.value = "";
    }
}

// GAME SETUP //////////////////////////////////////////////////////////////////

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
    players[name]["position"] = Object.keys(players).length - 1;
    players[name]["consecutiveFouls"] = 0;
    players[name]["wins"] = 0;
    
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
    document.getElementById("addPlayer").click();
    document.getElementById("addPlayers").style.display = "none";
    initGame();
})

function initGame() {
    document.getElementById("gameScreen").style.display = "block";
    
    let scoreboard = document.getElementById("scoreboard");
    for (let name of Object.keys(players)) {
        let scoreCard = document.createElement("div");
        scoreCard.setAttribute("id",`scoreCard:${name}`);
        scoreCard.setAttribute("class", "scoreCardActive");
        
        let nameNode = document.createElement("div");
        nameNode.setAttribute("name", "name");
        nameNode.appendChild(document.createTextNode(`${name}`));

        let scoreNode = document.createElement("div");
        scoreNode.setAttribute("name", "score");
        scoreNode.appendChild(document.createTextNode(`${players[name]["score"]}`));

        scoreCard.appendChild(nameNode);
        scoreCard.appendChild(scoreNode);

        scoreboard.appendChild(scoreCard);
    }
}

// PLAY GAME ///////////////////////////////////////////////////////////////////

document.getElementById("addScore").addEventListener("click", function(){
    let playerScore = document.getElementById("playerScore");
    if (playerScore.value < 0 || playerScore.value > 12) {
        focusElement(playerScore);
        document.getElementById("scoreInvalid").style.display = "block";
        return;
    }
    updatePlayerScore(playerScore.value);
    focusElement(playerScore, true);
})

document.getElementById("playerScore").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addScore").click();
        return;
    }
    let scoreInvalid = document.getElementById("scoreInvalid");
    if (scoreInvalid.style.display != "none") {
        scoreInvalid.style.display = "none";
    }
})

document.getElementById("miss").addEventListener("click", function(){
    updatePlayerScore(0);
    focusElement(document.getElementById("playerScore"), true);
})

function updatePlayerScore(score) {
    for (let name of Object.keys(players)) {
        if (players[name]["position"] != currPos) continue;

        if (players[name]["score"] + score == 50) {
            return playerWin(name);
        } else if (players[name]["score"] + score > 50) {
            players[name]["score"] = 25;
        } else {
            if (score == 0) {
                players[name]["consecutiveFouls"] += 1;
                if (players[name]["consecutiveFouls"] == 3) forfeit(name);
            } else {
                players[name]["consecutiveFouls"] = 0;
                players[name]["score"] += Number(score);
            }
        }

        cycleGameScreen(name);
        break;
    }
}

function cycleGameScreen(name) {
    currPos += 1;
    if (currPos >= Object.keys(players).length) currPos = 0;

    let scoreboard = document.getElementById("scoreboard");
    let scoreCard;
    for (let child of scoreboard.children) {
        if (child.id != `scoreCard:${name}`) continue;
        scoreCard = scoreboard.removeChild(child);
        break;
    }

    scoreCard.querySelector("[name='score']").innerHTML = `${players[name]["score"]}`;

    let inserted = false;
    for (let child of scoreboard.children) {
        if (child.id.match(/^scoreCard/) == null) continue;
        if (players[name]["score"] > child.querySelector("[name='score']").innerHTML) {
            scoreboard.insertBefore(scoreCard, child);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        scoreboard.appendChild(scoreCard);
    }

}

function playerWin(name) {

}

function forfeit(name) {

}