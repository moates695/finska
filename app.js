import { Game } from "./game.js";

let game = new Game();

function load() {

}

window.addEventListener("load", () => {
    load();
})

function save() {

}

function focusInput(element) {
    element.focus();
    element.select();
    if (clear) {
        element.value = "";
    }
}

document.getElementById("continueGame").addEventListener("click", () => {

})

document.getElementById("newGame").addEventListener("click", () => {

})
