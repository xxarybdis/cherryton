
const pullButton = document.getElementById("pullButton");
const result = document.getElementById("result");
const message = document.getElementById("message");

pullButton.addEventListener("click", () => {

    result.textContent = "✦";
    message.textContent = "¡Girando...!";

    pullButton.disabled = true;

    setTimeout(() => {

        const random = Math.random();

        if (random < 0.70) {

            result.textContent = "★";
            message.textContent = "¡Te salió común!";

        } else if (random < 0.95) {

            result.textContent = "★★★";
            message.textContent = "¡Te salió raro!";

        } else {

            result.textContent = "★★★★★";
            message.textContent = "¡¡¡ULTRA RARO!!!";

        }

        pullButton.disabled = false;

    }, 1500);

});
