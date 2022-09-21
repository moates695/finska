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
}

function updateUpcoming() {
    let upcoming = game.getUpcoming();
    document.getElementById("upNow").innerHTML = upcoming[0];
    document.getElementById("upNext").innerHTML = upcoming[1] != undefined ? upcoming[1] : upcoming[0];
}

function updateScoreboard() {
    let scoreboard = document.getElementById("scoreboardTable");
    let order = game.inScoreOrder();
    console.log(order);
    /* for (let i = 0; i < order.length; i++) {
        let tr = document.createElement("tr");
        // add td for each data point
        // might have to select the tbody instead of just the whole element
    } */
}

document.getElementById("swapInput").addEventListener("click", function() {
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
})
