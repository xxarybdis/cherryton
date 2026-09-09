/* =========================================
   CHERRYTON GACHA
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const machine =
    document.querySelector(".machine-wrap");

const machineImage =
    document.querySelector(".machine-img");

const capsules =
    document.querySelectorAll(".capsule");

const token =
    document.querySelector(".token");


/* =========================================
   ESTADOS
   ========================================= */

let machineIsRunning = false;
let tokenInserted = false;
let tokenIsDragging = false;


/* =========================================
   DATOS DEL ARRASTRE
   ========================================= */

let startPointerX = 0;
let startPointerY = 0;

let tokenMoveX = 0;
let tokenMoveY = 0;


/* =========================================
   AJUSTAR TAMAÑO DE LA MÁQUINA
   ========================================= */

function resizeMachine() {

    const naturalWidth =
        machineImage.naturalWidth;

    const naturalHeight =
        machineImage.naturalHeight;


    if (!naturalWidth || !naturalHeight) {
        return;
    }


    const isMobile =
        window.innerWidth <= 600;


    const maxWidth =
        window.innerWidth *
        (isMobile ? 0.96 : 0.90);


    const maxHeight =
        window.innerHeight *
        (isMobile ? 0.94 : 0.90);


    const scaleX =
        maxWidth / naturalWidth;

    const scaleY =
        maxHeight / naturalHeight;


    const scale =
        Math.min(
            scaleX,
            scaleY,
            1
        );


    machine.style.width =
        `${naturalWidth * scale}px`;

    machine.style.height =
        `${naturalHeight * scale}px`;
}


if (machineImage.complete) {

    resizeMachine();

} else {

    machineImage.addEventListener(
        "load",
        resizeMachine
    );

}


window.addEventListener(
    "resize",
    resizeMachine
);


/* =========================================
   NÚMERO ALEATORIO
   ========================================= */

function random(min, max) {

    return Math.random() *
        (max - min) +
        min;

}


/* =========================================
   LÍMITES DE CÁPSULAS
   ========================================= */

function getCapsuleLimits(capsule) {

    if (
        capsule.classList.contains(
            "capsule-1"
        )
    ) {

        return {
            left: -1,
            right: 10,
            up: 13,
            down: 1
        };

    }


    if (
        capsule.classList.contains(
            "capsule-6"
        )
    ) {

        return {
            left: -2,
            right: 11,
            up: 12,
            down: 3
        };

    }


    if (
        capsule.classList.contains(
            "capsule-5"
        )
    ) {

        return {
            left: -10,
            right: 2,
            up: 13,
            down: 1
        };

    }


    if (
        capsule.classList.contains(
            "capsule-9"
        )
    ) {

        return {
            left: -11,
            right: 3,
            up: 12,
            down: 3
        };

    }


    return {
        left: -12,
        right: 12,
        up: 15,
        down: 5
    };

}


/* =========================================
   ANIMAR CÁPSULA
   ========================================= */

function animateCapsule(
    capsule,
    index
) {

    const limits =
        getCapsuleLimits(capsule);


    const x1 =
        random(
            limits.left,
            limits.right
        );

    const y1 =
        random(
            -limits.up,
            -2
        );


    const x2 =
        random(
            limits.left,
            limits.right
        );

    const y2 =
        random(
            -limits.up * 0.55,
            limits.down
        );


    const x3 =
        random(
            limits.left,
            limits.right
        );

    const y3 =
        random(
            -limits.up * 0.75,
            limits.down
        );


    const r1 =
        random(-9, 9);

    const r2 =
        random(-12, 12);

    const r3 =
        random(-7, 7);


    const duration =
        random(1900, 2400);


    const delay =
        random(0, 180) +
        index * 12;


    return capsule.animate(
        [
            {
                translate: "0px 0px",
                rotate: "0deg",
                offset: 0
            },

            {
                translate:
                    `${x1}px ${y1}px`,

                rotate:
                    `${r1}deg`,

                offset: 0.28
            },

            {
                translate:
                    `${x2}px ${y2}px`,

                rotate:
                    `${r2}deg`,

                offset: 0.55
            },

            {
                translate:
                    `${x3}px ${y3}px`,

                rotate:
                    `${r3}deg`,

                offset: 0.78
            },

            {
                translate: "0px 0px",
                rotate: "0deg",
                offset: 1
            }
        ],

        {
            duration: duration,

            iterations: 1,

            delay: delay,

            easing:
                "cubic-bezier(0.45, 0, 0.25, 1)",

            fill: "none"
        }
    );

}


/* =========================================
   ACTIVAR CÁPSULAS
   ========================================= */

function runGacha() {

    if (machineIsRunning) {
        return;
    }


    machineIsRunning = true;


    capsules.forEach(
        (capsule, index) => {

            animateCapsule(
                capsule,
                index
            );

        }
    );


    setTimeout(
        () => {

            machineIsRunning = false;

        },

        2700
    );

}


/* =========================================
   POSICIÓN REAL DE LA RANURA
   ========================================= */

/*
   IMPORTANTE:

   El PNG tiene espacio transparente.

   Según tu captura, la ranura real
   se encuentra aproximadamente en:

   X = 30% del lienzo
   Y = 71% del lienzo
*/

function getTokenSlotPosition() {

    const machineRect =
        machine.getBoundingClientRect();


    return {

        /*
           CENTRO DE LA RANURA
        */

        x:
            machineRect.left +
            machineRect.width * 0.30,

        y:
            machineRect.top +
            machineRect.height * 0.71,


        /*
           ÁREA DE DETECCIÓN

           Es un poco más grande que
           la ranura dibujada para que
           insertar el token sea cómodo.
        */

        radiusX:
            machineRect.width * 0.055,

        radiusY:
            machineRect.height * 0.045

    };

}


/* =========================================
   ¿TOKEN CERCA DE LA RANURA?
   ========================================= */

function tokenIsNearSlot() {

    const tokenRect =
        token.getBoundingClientRect();


    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    const slot =
        getTokenSlotPosition();


    const distanceX =
        Math.abs(
            tokenCenterX -
            slot.x
        );

    const distanceY =
        Math.abs(
            tokenCenterY -
            slot.y
        );


    return (
        distanceX <= slot.radiusX &&
        distanceY <= slot.radiusY
    );

}


/* =========================================
   AGARRAR TOKEN
   ========================================= */

function startTokenDrag(event) {

    if (tokenInserted) {
        return;
    }


    tokenIsDragging = true;


    startPointerX =
        event.clientX -
        tokenMoveX;

    startPointerY =
        event.clientY -
        tokenMoveY;


    token.classList.add(
        "dragging"
    );


    token.setPointerCapture(
        event.pointerId
    );

}


/* =========================================
   MOVER TOKEN
   ========================================= */

function moveToken(event) {

    if (!tokenIsDragging) {
        return;
    }


    tokenMoveX =
        event.clientX -
        startPointerX;

    tokenMoveY =
        event.clientY -
        startPointerY;


    token.style.transform =
        `translate(
            ${tokenMoveX}px,
            ${tokenMoveY}px
        )`;


    /*
       Brilla cuando entra en
       la zona correcta.
    */

    if (tokenIsNearSlot()) {

        token.classList.add(
            "near-slot"
        );

    } else {

        token.classList.remove(
            "near-slot"
        );

    }

}


/* =========================================
   SOLTAR TOKEN
   ========================================= */

function endTokenDrag(event) {

    if (!tokenIsDragging) {
        return;
    }


    tokenIsDragging = false;


    token.classList.remove(
        "dragging"
    );


    if (
        token.hasPointerCapture(
            event.pointerId
        )
    ) {

        token.releasePointerCapture(
            event.pointerId
        );

    }


    if (tokenIsNearSlot()) {

        insertToken();

        return;
    }


    returnTokenHome();

}


/* =========================================
   REGRESAR TOKEN
   ========================================= */

function returnTokenHome() {

    token.classList.remove(
        "near-slot"
    );


    const animation =
        token.animate(
            [
                {
                    transform:
                        `translate(
                            ${tokenMoveX}px,
                            ${tokenMoveY}px
                        )`
                },

                {
                    transform:
                        "translate(0px, 0px)"
                }
            ],

            {
                duration: 450,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        );


    animation.onfinish = () => {

        tokenMoveX = 0;
        tokenMoveY = 0;

        token.style.transform =
            "translate(0px, 0px)";

    };

}


/* =========================================
   INSERTAR TOKEN
   ========================================= */

function insertToken() {

    if (tokenInserted) {
        return;
    }


    tokenInserted = true;


    token.classList.remove(
        "near-slot"
    );

    token.classList.add(
        "inserted"
    );


    const tokenRect =
        token.getBoundingClientRect();


    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    const slot =
        getTokenSlotPosition();


    const finalX =
        tokenMoveX +
        (
            slot.x -
            tokenCenterX
        );


    const finalY =
        tokenMoveY +
        (
            slot.y -
            tokenCenterY
        );


    /*
       El token primero es atraído
       hacia la ranura.
    */

    const animation =
        token.animate(
            [
                {
                    transform:
                        `translate(
                            ${tokenMoveX}px,
                            ${tokenMoveY}px
                        )
                        scale(1)`,

                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.82)`,

                    opacity: 1,

                    offset: 0.55
                },

                {
                    transform:
                        `translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.08)`,

                    opacity: 0
                }
            ],

            {
                duration: 600,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)",

                fill: "forwards"
            }
        );


    animation.onfinish = () => {

        token.style.visibility =
            "hidden";


        console.log(
            "Token insertado 🍒"
        );

        console.log(
            "Máquina con 1 crédito."
        );

    };

}


/* =========================================
   EVENTOS DEL TOKEN
   ========================================= */

token.addEventListener(
    "pointerdown",
    startTokenDrag
);

token.addEventListener(
    "pointermove",
    moveToken
);

token.addEventListener(
    "pointerup",
    endTokenDrag
);

token.addEventListener(
    "pointercancel",
    endTokenDrag
);
