import { Game } from "./game.js";

let game = new Game();
let messageTimeout = 3;

function load() {
    initScreen(false);
}

function initScreen(found) {
    let elems = document.body.children;
    for (let elem of elems) {
        if (found && elem.id == "welcomeOptions") {
            elem.style.display = "block";
        } else if (!found && elem.id == "addPlayers") {
            elem.style.display = "block";
            focusInput(document.getElementById("playerName"));
        }
    }
}

window.addEventListener("load", () => {
    load();
})

function save() {

}

function focusInput(element, clear=false) {
    element.focus();
    element.select();
    if (clear) {
        element.value = "";
    }
}

document.getElementById("continueGame").addEventListener("click", function() {

})

document.getElementById("newGame").addEventListener("click", function() {

})

function hideElem(elem) {
    elem.style.display = "none";
}

function hideId(id) {
    document.getElementById(id).style.display = "none";
}

function addPlayerFunc(ignore=false) {
    let playerName = document.getElementById("playerName");
    let name = playerName.value.trim();
    let errorAdd = document.getElementById("errorAddPlayer"); 

    if (name == "") {
        if (ignore) return true;
        focusInput(playerName);
        errorAdd.innerHTML = "you can't add nobody!";
        errorAdd.style.display = "block";
        return false;
    } else if (name.includes("~")) {
        errorAdd.innerHTML = "name cannot have characters '~' ";
        errorAdd.style.display = "block";
        return false;
    }

    if (!game.addPlayer(name)) {
        focusInput(playerName, true);
        errorAdd.innerHTML = `${name} already added!`;
        errorAdd.style.display = "block";
        return false;
    } 

    let listItem = document.createElement("li");
    listItem.appendChild(document.createTextNode(name));
    listItem.setAttribute("name", "addedPlayer");

    let rename = document.createElement("input");
    rename.setAttribute("style", "display: none");
    rename.setAttribute("id", `rename~${name}`);
    rename.setAttribute("class", "rename");
    rename.setAttribute("type", "text");
    rename.setAttribute("placeholder", name);
    rename.setAttribute("autocomplete", "off");
    rename.setAttribute("spellcheck", "false");
    rename.setAttribute("name", name);
    rename.addEventListener("keydown", function(event) {enterRename(event, listItem)});
    listItem.appendChild(rename);

    let remove = document.createElement("button");
    remove.appendChild(document.createTextNode("remove"));
    remove.setAttribute("style", "display: none");
    remove.setAttribute("id", `remove~${name}`);
    remove.setAttribute("class", "remove button-depressed");
    remove.classList.toggle("button-depressed")
    remove.setAttribute("name", "unselected");
    remove.addEventListener("click", function() {removePlayerBtn(this)});
    listItem.appendChild(remove);

    listItem.appendChild(document.createElement("br"));

    let small = document.createElement("small");
    small.setAttribute("style", "color: red; display: none");
    listItem.appendChild(small);

    document.getElementById("addedPlayers").appendChild(listItem);
    document.getElementById("addedPlayersDiv").style.display = "block";

    focusInput(playerName, true);
    document.getElementById("doneAddPlayer").removeAttribute("disabled");
    document.getElementById("editAddPlayer").removeAttribute("disabled");

    return true;
}

document.getElementById("addPlayer").addEventListener("click", function() {
    addPlayerFunc();
})

document.getElementById("playerName").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addPlayer").click();
    } else {
        hideId("errorAddPlayer");
    }
})

document.getElementById("doneAddPlayer").addEventListener("click", function() {
    if (addPlayerFunc(true)) {
        document.getElementById("addPlayers").style.display = "none";
        document.getElementById("errorAddPlayer").style.display = "none";
        updateGameScreen();
        document.getElementById("gameScreen").style.display = "block";
    }
})

let names = {};

function listBtn(visibility) {
    let items = document.querySelectorAll("#addedPlayers [name='addedPlayer']");
    for (let i = 0; i < items.length; i++) {
        for (let elem of items[i].childNodes) {
            let elemId = elem.id;
            if (elemId !== undefined) {
                elemId = elemId.split("~")[0];
            }
            if (["rename", "remove"].includes(elemId)) {
                elem.style.display = visibility;
                continue;
            }
            if (elem.nodeType != Node.TEXT_NODE) continue;
            if (visibility != "none") {
                names[i] = elem.nodeValue;
                elem.nodeValue = "";
            } else {
                elem.nodeValue = names[i];
            }     
        }
    }
    if (visibility == "none") {
        names = {};
    }
}

function disableInput() {
    document.getElementById("playerName").setAttribute("disabled", "disabled");
    document.getElementById("addPlayer").setAttribute("disabled", "disabled");
    document.getElementById("doneAddPlayer").setAttribute("disabled", "disabled");
}

function enableInput() {
    document.getElementById("playerName").removeAttribute("disabled");
    document.getElementById("addPlayer").removeAttribute("disabled");
    document.getElementById("doneAddPlayer").removeAttribute("disabled");
}

function showEditEscape() {
    document.getElementById("editAddPlayer").style.display = "none";
    document.getElementById("randomOrder").style.display = "none";
    document.getElementById("cancelEditAddPlayer").style.display = "inline";
    document.getElementById("applyEditAddPlayer").style.display = "inline";
}

function hideEditEscape() {
    document.getElementById("editAddPlayer").style.display = "inline";
    document.getElementById("randomOrder").style.display = "inline";
    document.getElementById("cancelEditAddPlayer").style.display = "none";
    document.getElementById("applyEditAddPlayer").style.display = "none";
}

function revertEditMode() {
    hideEditEscape();
    enableInput();
    listBtn("none");
    focusInput(playerName, true);
}

document.getElementById("editAddPlayer").addEventListener("click", function() {
    document.getElementById("errorAddPlayer").style.display = "none";
    showEditEscape();
    disableInput();
    listBtn("inline");
})

function unselectRemoveBtns() {
    let items = document.querySelectorAll("#addedPlayers [name='addedPlayer']");
    for (let i = 0; i < items.length; i++) {
        items[i].lastChild.style.display = "none";
        for (let elem of items[i].childNodes) {
            let elemId = elem.id;
            if (elemId !== undefined) {
                elemId = elemId.split("~")[0];
            }
            if (elemId == "rename") {
                elem.value = "";
            }
            if (elemId == "remove" && elem.getAttribute("name") == "selected") {
                elem.classList.toggle("button-depressed");
                elem.setAttribute("name", "unselected");
            }   
        }
    }
}

document.getElementById("cancelEditAddPlayer").addEventListener("click", function() {
    revertEditMode();
    unselectRemoveBtns();
})

document.getElementById("applyEditAddPlayer").addEventListener("click", function() {
    let items = document.querySelectorAll("#addedPlayers [name='addedPlayer']");
    let invalid = false;
    for (let i = 0; i < items.length; i++) {
        if (names[i] == undefined) continue;
        for (let elem of items[i].childNodes) {
            if (elem.id == undefined || elem.id.split("~")[0] != "rename") continue;
            if (elem.value == "") continue;
            if (game.hasPlayer(elem.value)) {
                invalid = true;
                let small = items[i].lastChild;
                small.innerHTML = `${elem.value} is already taken!`
                small.style.display = "inline";
                continue;
            } 
            
            let player = game.getPlayer(names[i]);
            game.renamePlayer(player.getName(), elem.value);
            names[i] = elem.value;
        }
    }

    let toRemove = [];
    for (let i = 0; i < items.length; i++) {
        for (let elem of items[i].childNodes) {
            if (elem.id == undefined || elem.id.split("~")[0] != "remove") continue;
            if (elem.getAttribute("name") == "selected") {
                game.removePlayer(names[i]);
                toRemove.push(i);
                continue;
            }
        }
    }
    let originalLength = items.length;
    let offset = 0;
    let addedPlayers = document.getElementById("addedPlayers");
    for (let i of toRemove) {
        let pos = i - offset;
        addedPlayers.removeChild(addedPlayers.children[pos]);
        offset += 1;
        delete names[pos];
        for (let x = pos + 1; x < originalLength; x++) {
            if (names[x] == undefined) continue;
            names[x - 1] = names[x];
            delete names[x];
        }
    }
    
    if (!invalid) {
        revertEditMode();
        unselectRemoveBtns();
    }
})

function enterRename(event, listItem) {
    if (event.key == "Enter") {
        document.getElementById("applyEditAddPlayer").click();
    } else {
        listItem.lastChild.style.display = "none";
    }
}

function removePlayerBtn(btn) {
    if (btn.getAttribute("name") == "unselected") {
        btn.classList.toggle("button-depressed");
        btn.setAttribute("name", "selected");
    } else {
        btn.classList.toggle("button-depressed");
        btn.setAttribute("name", "unselected");
    }
}

document.getElementById("randomOrder").addEventListener("click", function() {
    let elems = [];
    let length = document.querySelectorAll("#addedPlayers [name='addedPlayer']").length;
    for (let elem of document.querySelectorAll("#addedPlayers [name='addedPlayer']")) {
        elems.push(elem);
    }

    // Fischer-Yates shuffle
    for (let i = length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let elem = elems[i];
        elems[i] = elems[j];
        elems[j] = elem;
    }

    let addedPlayers = document.getElementById("addedPlayers");
    while (addedPlayers.firstChild) {
        addedPlayers.removeChild(addedPlayers.lastChild);
    }
    for (let elem of elems) {
        addedPlayers.appendChild(elem);
    }
    let order = {};
    for (let i = 0; i < length; i++) {
        order[elems[i].firstChild.nodeValue] = i;
    }
    game.newOrder(order);
})

// Game Screen /////////////////////////////////////////////////////////////////

function updateGameScreen() {
    updateUpcoming();
    updateScoreboard();
    updateSkipSitout();
}

function updateUpcoming() {
    let upcoming = game.getUpcoming();
    if (upcoming[0] == undefined) return;
    document.getElementById("upNow").innerHTML = upcoming[0];
    document.getElementById("upNext").innerHTML = upcoming[1] != undefined ? upcoming[1] : upcoming[0];
}

function updateScoreboard() {
    let scoreboard = document.getElementById("scoreboardTable");
    let order = game.inScoreOrder();

    while (scoreboard.rows.length > 1) {
        scoreboard.deleteRow(1);
    }

    let winCol = game.anyWins();

    for (let i = 0; i < order.length; i++) {
        let row = scoreboard.insertRow(i + 1);
        row.insertCell(0).innerHTML = i + 1;
        row.insertCell(1).innerHTML = order[i].getName();
        let currScore = order[i].getScore().toString();
        let winThrow = game.canWin(currScore);
        if (winThrow != null) {
            currScore += winThrow.toString().sub();
        }
        row.insertCell(2).innerHTML = currScore;
        if (winCol) {
            row.insertCell(3).innerHTML = order[i].getWins();
        }
    }
}

function updateSkipSitout() {
    if (game.numActive() > 1) {
        document.getElementById("skip").removeAttribute("disabled");
        document.getElementById("sitout").removeAttribute("disabled");
    } else {
        document.getElementById("skip").setAttribute("disabled", "disabled");
        document.getElementById("sitout").setAttribute("disabled", "disabled");
    }
}

/* document.getElementById("swapInput").addEventListener("click", function() {
    if (this.getAttribute("name") == "total") {
        this.innerHTML = "swap to total";
        document.getElementById("inputTotal").style.display = "none";
        document.getElementById("inputPins").style.display = "block";
        this.setAttribute("name", "pins");
    } else {
        this.innerHTML = "swap to pins";
        document.getElementById("inputTotal").style.display = "block";
        document.getElementById("inputPins").style.display = "none";
        this.setAttribute("name", "total");
    }
}) */

document.querySelectorAll("#inputTotalGrid .grid-item").forEach(elem => {
    elem.addEventListener("click", function() {numInputBtn(elem)});
})

function numInputBtn(elem) {
    document.getElementById("scoreTotalErr").style.display = "none";
    let scoreTotal = document.getElementById("scoreTotal");
    if (elem.getAttribute("name") == "del" && scoreTotal.innerHTML.length > 0) {
        scoreTotal.innerHTML = scoreTotal.innerHTML.substring(0, scoreTotal.innerHTML.length - 1);
    } else if (elem.getAttribute("name") == "ent" && scoreTotal.innerHTML != "") {
        game.addScore(Number(scoreTotal.innerHTML));
        scoreTotal.innerHTML = "";
        updateGameScreen();
    } else if (elem.getAttribute("name") == "num") {
        scoreTotal.innerHTML += elem.innerHTML;
        if (scoreTotal.innerHTML > 12) {
            document.getElementById("scoreTotalErr").innerHTML = `max score is 12, you entered ${scoreTotal.innerHTML}`;
            document.getElementById("scoreTotalErr").style.display = "block";
            scoreTotal.innerHTML = "";
            return;
        }
    }
}

document.getElementById("skip").addEventListener("click", function() {
    game.skipTurn();
    updateGameScreen();
})

document.getElementById("sitout").addEventListener("click", function() {
    game.sitoutPlayer();
    updateGameScreen();
})

document.querySelectorAll("#inputPinsGrid .grid-item").forEach(elem => {
    elem.addEventListener("click", function() {pinInputBtn(elem)});
})

function pinInputBtn(elem) {
    if (elem.getAttribute("name") == "pin") {
        elem.classList.toggle("button-depressed");
        let num = 0;
        document.querySelectorAll("#inputPinsGrid .grid-item").forEach(elem => {
            if (elem.getAttribute("name") == "pin" && elem.classList.contains("button-depressed")) {
                num++;
            }
        })
        if (num > 0) {
            document.getElementById("pinEnter").removeAttribute("disabled");
        } else {
            document.getElementById("pinEnter").setAttribute("disabled", "disabled");
        }
        return;
    } 
    
    if (elem.getAttribute("name") == "miss") {
        game.addScore(0);
    } else {
        let total = 0;
        document.querySelectorAll("#inputPinsGrid .grid-item").forEach(elem => {
            if (elem.getAttribute("name") == "pin" && elem.classList.contains("button-depressed")) {
                total += Number(elem.innerHTML);
            }
        })
        game.addScore(total);
    }

    document.querySelectorAll("#inputPinsGrid .grid-item").forEach(elem => {
        if (elem.getAttribute("name") == "pin" && elem.classList.contains("button-depressed")) {
            elem.classList.remove("button-depressed");
        }
    })
    updateGameScreen();
}

document.getElementById("winContinue").addEventListener("click", function() {
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
})

document.getElementById("winFinish").addEventListener("click", function() {
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("exitConfirm").style.display = "block";
})

document.getElementById("loseContinue").addEventListener("click", function() {
    document.getElementById("loseScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
})

document.getElementById("loseFinish").addEventListener("click", function() {
    document.getElementById("loseScreen").style.display = "none";
    document.getElementById("exitConfirm").style.display = "block";
})

document.getElementById("finishYeah").addEventListener("click", function() {
    document.getElementById("exitConfirm").style.display = "none";
    document.getElementById("welcomeOptions").style.display = "block";
})

document.getElementById("finishNah").addEventListener("click", function() {
    document.getElementById("exitConfirm").style.display = "none";
    if (game.numActive() != 0) {
        document.getElementById("winScreen").style.display = "block";
    } else {
        document.getElementById("loseScreen").style.display = "block";
    }
})

document.getElementById("editGame").addEventListener("click", function() {
    document.getElementById("gameScreen").style.display = "none";
    let players = game.inScoreOrder();
    let list = document.getElementById("lastThrows");
    list.innerHTML = "";

    for (let player of players) {
        let listItem = document.createElement("li");
        listItem.appendChild(document.createTextNode(`${player.getName()} = `));
        
        let input = document.createElement("input");
        input.setAttribute("type", "number");
        input.setAttribute("class", "input-number");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("placeholder", player.getScore());
        input.addEventListener("input", () => {
            document.getElementById("lastThrowErr").style.display = "none";
        });
        listItem.appendChild(input);

        list.appendChild(listItem);
    }
    document.getElementById("editLastThrow").style.display = "block";
})

document.getElementById("discardThrowChange").addEventListener("click", function() {
    document.getElementById("editLastThrow").style.display = "none";
    document.getElementById("lastThrowErr").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
})

document.getElementById("applyThrowChange").addEventListener("click", function() {
    document.getElementById("lastThrowErr").style.display = "none";

    let list = document.getElementById("lastThrows");
    for (let elem of list.children) {
        if (elem.children[0].value < 0) {
            document.getElementById("lastThrowErr").style.display = "block";
            return;
        }
    }
    document.getElementById("editLastThrow").style.display = "none";

    let names = {};
    for (let elem of list.children) {
        if (elem.children[0].value.length > 0) {
            names[elem.textContent.slice(0, elem.textContent.length - 3)] = Number(elem.children[0].value);
        }
    }
    game.changeLastThrow(names);

    updateScoreboard();
    document.getElementById("gameScreen").style.display = "block";
})

document.getElementById("addPlayerDuring").addEventListener("click", function() {
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("randomOrder").style.display = "none";
    document.getElementById("addPlayers").style.display = "block";
    focusInput(document.getElementById("playerName"), true);
})

function fillOut(ruleSet) {
    if (["classic", "fast"].includes(ruleSet)) {
        if (ruleSet == "classic") {
            document.getElementById("pinValueVariable").classList.toggle("button-depressed");
            document.getElementById("classic").classList.toggle("button-depressed");
        } else {
            document.getElementById("pinValueNumber").classList.toggle("button-depressed");
            document.getElementById("fast").classList.toggle("button-depressed");
        }
        document.getElementById("missLimit").setAttribute("placeholder", 3);
        document.getElementById("elimDurationInf").classList.toggle("button-depressed");
        document.getElementById("winScore").setAttribute("placeholder", );
        document.getElementById("resetScore").setAttribute("placeholder", );
    } else if (ruleSet == "current") {
        let rules = game.getCurrentRules();
        document.getElementById(rules["ruleSet"]).classList.toggle("button-depressed");
        if (rules["pinValue"] == "variable") {
            document.getElementById("pinValueVariable").classList.toggle("button-depressed");
        } else {
            document.getElementById("pinValueNumber").classList.toggle("button-depressed");
        }        
        if (rules["missLimit"] < Infinity) {
            document.getElementById("missLimit").setAttribute("placeholder", rules["missLimit"]);
        } else {
            document.getElementById("missLimitNone").classList.add("button-depressed");
            document.getElementById("missLimitNone").setAttribute("name", "selected");
        }
        if (rules["elimDuration"] < Infinity) {
            document.getElementById("elimDuration").setAttribute("placeholder", rules["elimDuration"]);
        } else {
            document.getElementById("elimDurationInf").classList.toggle("button-depressed");
            document.getElementById("elimDurationInf").setAttribute("name", "selected");
        }
        document.getElementById("winScore").setAttribute("placeholder", rules["winScore"]);
        document.getElementById("resetScore").setAttribute("placeholder", rules["resetScore"]);
    } else {
        let rules = game.getCurrentRules();
        document.getElementById("custom").classList.toggle("button-depressed");
        if (rules["pinValue"] == "variable") {
            document.getElementById("pinValueVariable").classList.toggle("button-depressed");
        } else {
            document.getElementById("pinValueNumber").classList.toggle("button-depressed");
        }
        document.getElementById("pinValueNumber").classList.toggle("button-depressed");
        document.getElementById("missLimit").setAttribute("placeholder", rules["missLimit"]);
        document.getElementById("elimDuration").setAttribute("placeholder", rules["elimDuration"]);
        document.getElementById("winScore").setAttribute("placeholder", rules["winScore"]);
        document.getElementById("resetScore").setAttribute("placeholder", rules["resetScore"]);
    }
}

document.getElementById("editRules").addEventListener("click", function() {
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("editGameRules").style.display = "block";
    fillOut("current");
})

document.getElementById("classic").addEventListener("click", function() {
    this.classList.add("button-depressed");
    document.getElementById("fast").classList.remove("button-depressed");
    document.getElementById("custom").classList.remove("button-depressed");
})

document.getElementById("fast").addEventListener("click", function() {
    this.classList.add("button-depressed");
    document.getElementById("classic").classList.remove("button-depressed");
    document.getElementById("custom").classList.remove("button-depressed");
})

document.getElementById("custom").addEventListener("click", function() {
    this.classList.add("button-depressed");
    document.getElementById("classic").classList.remove("button-depressed");
    document.getElementById("fast").classList.remove("button-depressed");
})

document.getElementById("missLimit").addEventListener("input", function () {
    let missLimitNone = document.getElementById("missLimitNone");
    missLimitNone.classList.remove("button-depressed");
    missLimitNone.setAttribute("name", "unselected");
})

document.getElementById("missLimitNone").addEventListener("click", function() {
    document.getElementById("missLimitErr").style.display = "none";
    this.classList.toggle("button-depressed");
    let missLimit = document.getElementById("missLimit");
    missLimit.value = "";
    if (this.getAttribute("name") == "selected") {
        this.setAttribute("name", "unselected");
        let rules = game.getCurrentRules();
        if (rules["missLimit"] < Infinity) {
            missLimit.setAttribute("placeholder", rules["missLimit"]);
        } else {
            missLimit.setAttribute("placeholder", "Inf");
        }
    } else {
        this.setAttribute("name", "selected");
        missLimit.removeAttribute("placeholder");
    }
})

document.getElementById("elimDuration").addEventListener("input", function () {
    let elimDurationInf = document.getElementById("elimDurationInf");
    elimDurationInf.classList.remove("button-depressed");
    elimDurationInf.setAttribute("name", "unselected");
})

document.getElementById("elimDurationInf").addEventListener("click", function() {
    document.getElementById("elimDurationErr").style.display = "none";
    this.classList.toggle("button-depressed");
    let elimDuration = document.getElementById("elimDuration");
    elimDuration.value = "";
    if (this.getAttribute("name") == "selected") {
        this.setAttribute("name", "unselected");
        let rules = game.getCurrentRules();
        if (rules["elimDuration"] < Infinity) {
            elimDuration.setAttribute("placeholder", rules["elimDuration"]);
        } else {
            elimDuration.setAttribute("placeholder", "Inf");
        }
    } else {
        this.setAttribute("name", "selected");
        elimDuration.removeAttribute("placeholder");
    }
})

document.getElementById("pinValueVariable").addEventListener("click", function() {
    this.classList.add("button-depressed");
    document.getElementById("pinValueNumber").classList.remove("button-depressed");
})

document.getElementById("pinValueNumber").addEventListener("click", function() {
    this.classList.add("button-depressed");
    document.getElementById("pinValueVariable").classList.remove("button-depressed");
})

function clearButtonsRuleEdit() {
    document.getElementById("classic").classList.remove("button-depressed");
    document.getElementById("fast").classList.remove("button-depressed");
    document.getElementById("custom").classList.remove("button-depressed");
    document.getElementById("elimDurationInf").classList.remove("button-depressed");
    document.getElementById("elimDurationInf").setAttribute("name", "unselected");
    document.getElementById("pinValueVariable").classList.remove("button-depressed");
    document.getElementById("pinValueNumber").classList.remove("button-depressed");
    document.getElementById("missLimitNone").classList.remove("button-depressed");
    document.getElementById("missLimitNone").setAttribute("name", "unselected");
}

document.getElementById("alterGameRulesNo").addEventListener("click", function() {
    document.getElementById("editGameRules").style.display = "none";
    document.getElementById("missLimitErr").style.display = "none";
    document.getElementById("elimDurationErr").style.display = "none";
    document.getElementById("winScoreErr").style.display = "none";
    document.getElementById("resetScoreErr").style.display = "none";
    clearButtonsRuleEdit();
    document.getElementById("gameScreen").style.display = "block";
})

document.getElementById("missLimit").addEventListener("input", function () {
    document.getElementById("missLimitErr").style.display = "none";
})

document.getElementById("elimDuration").addEventListener("input", function () {
    document.getElementById("elimDurationErr").style.display = "none";
})

document.getElementById("winScore").addEventListener("input", function () {
    document.getElementById("winScoreErr").style.display = "none";
})

document.getElementById("resetScore").addEventListener("input", function () {
    document.getElementById("resetScoreErr").style.display = "none";
})

document.getElementById("alterGameRulesYes").addEventListener("click", function() {
    let err = false;
    if (document.getElementById("missLimit").value < 0) {
        err = true;
        document.getElementById("missLimitErr").style.display = "block";
    }
    if (document.getElementById("elimDuration").value < 0) {
        err = true;
        document.getElementById("elimDurationErr").style.display = "block";
    }
    if (document.getElementById("winScore").value <= 0) {
        err = true;
        document.getElementById("winScoreErr").style.display = "block";
    }
    if (document.getElementById("resetScore").value < 0) {
        err = true;
        document.getElementById("resetScoreErr").style.display = "block";
    }
    if (err) return;

    document.getElementById("editGameRules").style.display = "none";
    clearButtonsRuleEdit();
    //apply changes
    document.getElementById("gameScreen").style.display = "block";
})

// clear inputs on back and alter, apply changes next. Then onto saving the game and loading it