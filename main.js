// PREREQS /////////////////////////////////////////////////////////////////////

//const saved = localStorage.getItem("players");
let players = localStorage.getItem("players");
if (players !== null) {
    players = JSON.parse(localStorage.getItem("players"));
} else {
    players = {};
}

let currPos = localStorage.getItem("currPos");
if (currPos !== null) {
    currPos = Number(currPos);
} else {
    currPos = 0;
}

let winScore = localStorage.getItem("winScore");
if (winScore !== null) {
    winScore = Number(winScore);
} else {
    winScore = 50;
}

let gameRules = localStorage.getItem("gameRules");
if (gameRules === null) gameRules = "classic";

let minScore = localStorage.getItem("minScore");
if (minScore !== null) {
    minScore = Number(minScore);
} else {
    minScore = 0;
}

let maxScore = localStorage.getItem("maxScore");
if (maxScore !== null) {
    maxScore = Number(maxScore);
} else {
    if (gameRules == "classic") {
        maxScore = 12;
        document.getElementById("scoreInvalid").innerHTML = "Whoops, valid scores are 0 to 12";
    } else {
        maxScore = 78;
        document.getElementById("scoreInvalid").innerHTML = "Whoops, valid scores are 0 to 78";
    }
    
}

let resetScore = localStorage.getItem("maxScore");
if (resetScore !== null) {
    resetScore = Number(resetScore);
} else {
    resetScore = Math.floor(winScore / 2);
}

let forfeitPlayers = localStorage.getItem("allowForfeit");
if (forfeitPlayers !== null) {
    forfeitPlayers = JSON.parse(forfeitPlayers);
} else {
    forfeitPlayers = {};
}

let allowForfeit = localStorage.getItem("allowForfeit");
if (allowForfeit !== null) {
    allowForfeit = (allowForfeit.toLowerCase() === "true");
} else {
    allowForfeit = true;
}

let forfeitFouls = localStorage.getItem("forfeitFouls");
if (forfeitFouls !== null) {
    forfeitFouls = Number(forfeitFouls);
} else {
    forfeitFouls = 3;
}

let forfeitDuration = localStorage.getItem("forfeitDuration");
if (forfeitDuration !== null) {
    forfeitDuration = Number(forfeitDuration);
} else {
    forfeitDuration = Infinity;
}

function checkStorage() {
    if (typeof(Storage) === "undefined") {
        document.getElementById("noLocalStorage").style.display = "block";
        return;
    }
    if (Object.keys(players).length == 0) {
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
        element.value = "";
    }
}

function hide(name) {
    let element = document.getElementById(name);
    if (element.style.display != "none") {
        element.style.display = "none";
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
        return false;
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
    hide("playerExists");
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
    focusElement(document.getElementById("playerScore"));

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

document.getElementById("editGameRuleBtn").addEventListener("click", function(){
    this.style.display = "none";
    document.getElementById("gameRuleEditor").style.display = "block";
})

document.getElementById("classicRules").addEventListener("click", function(){
    document.getElementById("gameRuleEditor").style.display = "none";
    gameRules = "classic";
    document.getElementById("editGameRuleBtn").style.display = "block";
    ruleTimeout();
})

document.getElementById("fastRules").addEventListener("click", function(){
    document.getElementById("gameRuleEditor").style.display = "none";
    gameRules = "fast";
    document.getElementById("editGameRuleBtn").style.display = "block";
    ruleTimeout();
})

document.getElementById("customRules").addEventListener("click", function(){
    document.getElementById("gameRuleEditor").style.display = "none";
    gameRules = "custom";
})

document.getElementById("rulesBack").addEventListener("click", function(){
    document.getElementById("gameRuleEditor").style.display = "none";
    document.getElementById("editGameRuleBtn").style.display = "block";
})

function ruleTimeout() {
    let chosenRuleDisplay = document.getElementById("chosenRuleDisplay");
    chosenRuleDisplay.innerHTML = `You selected the ${gameRules} rules`;
    chosenRuleDisplay.style.display = "block";
    setTimeout(function(){
        document.getElementById("chosenRuleDisplay").style.display = "none";
    }, 5000);
}

// PLAY GAME ///////////////////////////////////////////////////////////////////

document.getElementById("addScore").addEventListener("click", function(){
    let playerScore = document.getElementById("playerScore");
    if (playerScore.value < 0 || playerScore.value > 12) {
        focusElement(playerScore);
        document.getElementById("scoreInvalid").style.display = "block";
        return;
    }
    hide("scoreInvalid");
    updatePlayerScore(Number(playerScore.value));
    focusElement(playerScore, true);
})

document.getElementById("playerScore").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addScore").click();
        return;
    }
    hide("scoreInvalid");
})

document.getElementById("miss").addEventListener("click", function(){
    updatePlayerScore(0);
    focusElement(document.getElementById("playerScore"), true);
})

document.getElementById("skip").addEventListener("click", function(){
    cyclePosition();
    focusElement(document.getElementById("playerScore"), true);
})

function updatePlayerScore(score) {
    for (let name of Object.keys(players)) {
        if (players[name]["position"] != currPos) continue;
        if (forfeitPlayers[name] != undefined || forfeitPlayers[name] > 0) continue;
        if (players[name]["score"] + score == winScore) {
            players[name]["score"] = winScore;
            playerWin(name);
        } else if (players[name]["score"] + score > winScore) {
            players[name]["score"] = resetScore;
        } else {
            if (score == 0) {
                players[name]["consecutiveFouls"] += 1;
                if (players[name]["consecutiveFouls"] == forfeitFouls) forfeit(name);
            } else {
                players[name]["consecutiveFouls"] = 0;
                players[name]["score"] += score;
            }
        }

        cyclePosition();
        cycleGameScreen(name);
        break;
    }
}

function checkPlayOn() {
    if (Object.keys(forfeitPlayers).length == Object.keys(players).length) {
        loseGame();
        return false;
    }
    return true;
}

function cyclePosition() {
    let failsafe = currPos;
    while (1) {
        currPos += 1;
        if (currPos >= Object.keys(players).length) currPos = 0;
        if (currPos == failsafe) break;
        
        let found = false;
        for (let name of Object.keys(players)) {
            if (players[name]["position"] != currPos) continue;
            if (forfeitPlayers[name] == undefined) {
                found = true;
                break;
            }
            forfeitPlayers[name] -= 1;
            if (forfeitPlayers[name] == 0) revertForfeit(name);
        }
        if (found) {
            break
        }
    }
}

function cycleGameScreen(name) {
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
    let winScreen = document.getElementById("winScreen");
    winScreen.querySelector("[id='winMessage']").innerHTML = `Looks like ${name} has reached 50 points!`;
    winScreen.style.display = "block";
}

function loseGame() {
    document.getElementById("loseScreen").style.display = "block";
}

document.getElementById("playOn").addEventListener("click", function(){
    document.getElementById("winScreen").style.display = "none";
    for (let name of Object.keys(players)) {
        if (players[name]["score"] == winScore) {
            players[name]["score"] = resetScore;
            cycleGameScreen(name);
            break;
        }
    }
})

document.getElementById("fin").addEventListener("click", function(){
    document.getElementById("winScreenPrompt").style.display = "none";
    document.getElementById("ensureFin").style.display = "block";
})

document.getElementById("cancelFin").addEventListener("click", function(){
    document.getElementById("ensureFin").style.display = "none";
    document.getElementById("winScreenPrompt").style.display = "block";
})

document.getElementById("yesFin").addEventListener("click", function(){
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    purgePlayers();
    document.getElementById("addPlayers").style.display = "block";
})

function purgePlayers() {
    players = {};
    forfeitPlayers = {};
    currPos = 0;
}

document.getElementById("finLose").addEventListener("click", function(){
    document.getElementById("loseScreen").style.display = "none"
    document.getElementById("gameScreen").style.display = "none";
    purgePlayers();
    document.getElementById("addPlayers").style.display = "block";
})

document.getElementById("playOnLose").addEventListener("click", function(){
    document.getElementById("loseScreen").style.display = "none"
})

function forfeit(name) {
    if (!checkPlayOn()) return;
    if (!allowForfeit) return;

    for (let scoreCard of document.getElementById("scoreboard").children) {
        if (scoreCard.id != `scoreCard:${name}`) continue;
        scoreCard.setAttribute("class", "scoreCardInactive");
        forfeitPlayers[name] = forfeitDuration;

        let unForfeit = document.createElement("button");
        unForfeit.setAttribute("id", `rejoin:${name}`);
        unForfeit.setAttribute("class", "rejoin");
        unForfeit.innerHTML = "rejoin";
        scoreCard.appendChild(unForfeit);
        break;
    }
    
}

function revertForfeit(name) {
    for (let scoreCard of document.getElementById("scoreboard").children) {
        if (scoreCard.id != `scoreCard:${name}`) continue;
        scoreCard.setAttribute("class", "scoreCardActive");
        delete forfeitPlayers[name];
        break;
    }
}

document.getElementById("addPlayerMidgame").addEventListener("click", function() {
    let addPlayer = document.getElementById("addPlayers");
    addPlayer.style.display = "block";
    addPlayer.querySelector("[id='startScore']").style.display = "block";
})

document.getElementById("randOrder").addEventListener("click", function(){
    
})

// add game rules edit option; autofill with current values/options

// sitout player midGame

// remove player midGame

document.getElementById("sitoutPlayer").addEventListener("click", function(){
    
})

document.getElementById("removePlayer").addEventListener("click", function(){
    
})