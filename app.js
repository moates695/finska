import { Game } from "./game.js";

let game = new Game();
let errorTimeout = 3;

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

document.getElementById("addPlayer").addEventListener("click", function() {
    let playerName = document.getElementById("playerName");
    let name = playerName.value.trim();
    let errorAdd = document.getElementById("errorAddPlayer");

    if (name == "") {
        focusInput(playerName);
        errorAdd.innerHTML = "you can't add nobody!";
        errorAdd.style.display = "block";
        return;
    } else if (name.includes("~")) {
        errorAdd.innerHTML = "name cannot have characters '~' ";
        errorAdd.style.display = "block";
        return;
    }

    if (!game.addPlayer(name)) {
        focusInput(playerName, true);
        errorAdd.innerHTML = `${name} already added!`;
        errorAdd.style.display = "block";
        return;
    }

    let listItem = document.createElement("li");
    listItem.appendChild(document.createTextNode(`${name}`));
    listItem.setAttribute("name", "addedPlayer");

    let rename = document.createElement("button");
    rename.appendChild(document.createTextNode("rename"));
    rename.setAttribute("style", "display: none");
    rename.setAttribute("class", "rename");
    listItem.appendChild(rename);

    let remove = document.createElement("button");
    remove.appendChild(document.createTextNode("remove"));
    remove.setAttribute("style", "display: none");
    remove.setAttribute("class", "remove");
    listItem.appendChild(remove);

    document.getElementById("addedPlayers").appendChild(listItem);
    document.getElementById("addedPlayersDiv").style.display = "block";

    focusInput(playerName, true);
    document.getElementById("doneAddPlayer").removeAttribute("disabled");
    document.getElementById("editAddPlayer").removeAttribute("disabled");
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

})

function listBtn(visibility) {
    let items = document.querySelectorAll("#addedPlayers [name='addedPlayer']");
    for (let item of items) {
        for (let elem of item.children) {
            if (["rename", "remove"].includes(elem.className)) elem.style.display = visibility; 
        }
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
    document.getElementById("cancelEditAddPlayer").style.display = "inline";
    document.getElementById("applyEditAddPlayer").style.display = "inline";
}

function hideEditEscape() {
    document.getElementById("editAddPlayer").style.display = "inline";
    document.getElementById("cancelEditAddPlayer").style.display = "none";
    document.getElementById("applyEditAddPlayer").style.display = "none";
}

document.getElementById("editAddPlayer").addEventListener("click", function() {
    showEditEscape();
    disableInput();
    listBtn("inline");
})

document.getElementById("cancelEditAddPlayer").addEventListener("click", function() {
    hideEditEscape();
    enableInput();
    listBtn("none");
    focusInput(playerName, true);
})

document.getElementById("applyEditAddPlayer").addEventListener("click", function() {
    hideEditEscape();
    enableInput();
    listBtn("none");
    focusInput(playerName, true);
})
