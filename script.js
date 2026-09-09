/* =========================================
   CHERRYTON GACHA
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const machine = document.querySelector(".machine-wrap");

const capsules =
    document.querySelectorAll(".capsule");

const token =
    document.querySelector(".token");

const tokenSlot =
    document.querySelector(".token-slot");


/* =========================================
   ESTADO DE LA MÁQUINA
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
   NÚMERO ALEATORIO
   ========================================= */

function random(min, max) {

    return Math.random() * (max - min) + min;

}


/* =========================================
   LÍMITES DE LAS CÁPSULAS
   ========================================= */

function getCapsuleLimits(capsule) {

    /* Abajo izquierda */

    if (capsule.classList.contains("capsule-1")) {

        return {
            left: -1,
            right: 10,
            up: 13,
            down: 1
        };

    }


    /* Izquierda */

    if (capsule.classList.contains("capsule-6")) {

        return {
            left: -2,
            right: 11,
            up: 12,
            down: 3
        };

    }


    /* Abajo derecha */

    if (capsule.classList.contains("capsule-5")) {

        return {
            left: -10,
            right: 2,
            up: 13,
            down: 1
        };

    }


    /* Derecha */

    if (capsule.classList.contains("capsule-9")) {

        return {
            left: -11,
            right: 3,
            up: 12,
            down: 3
        };

    }


    /* Interior */

    return {
        left: -12,
        right: 12,
        up: 15,
        down: 5
    };

}


/* =========================================
   ANIMAR UNA CÁPSULA
   ========================================= */

function animateCapsule(capsule, index) {

    const limits =
        getCapsuleLimits(capsule);


    const x1 =
        random(limits.left, limits.right);

    const y1 =
        random(-limits.up, -2);


    const x2 =
        random(limits.left, limits.right);

    const y2 =
        random(-limits.up * 0.55, limits.down);


    const x3 =
        random(limits.left, limits.right);

    const y3 =
        random(-limits.up * 0.75, limits.down);


    const r1 = random(-9, 9);
    const r2 = random(-12, 12);
    const r3 = random(-7, 7);


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

/*
   Esta función se queda preparada.

   Ya NO se activa haciendo clic
   sobre toda la máquina.

   Más adelante la llamaremos
   cuando giremos la perilla.
*/

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


    setTimeout(() => {

        machineIsRunning = false;

    }, 2700);

}


/* =========================================
   COMPROBAR SI EL TOKEN
   ESTÁ CERCA DE LA RANURA
   ========================================= */

function tokenIsOverSlot() {

    const tokenRect =
        token.getBoundingClientRect();

    const slotRect =
        tokenSlot.getBoundingClientRect();


    /*
       Usamos el centro del token.

       Así no hace falta colocar
       absolutamente toda la moneda
       dentro de la zona.
    */

    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    return (
        tokenCenterX >= slotRect.left &&
        tokenCenterX <= slotRect.right &&
        tokenCenterY >= slotRect.top &&
        tokenCenterY <= slotRect.bottom
    );

}


/* =========================================
   EMPEZAR A ARRASTRAR
   ========================================= */

function startTokenDrag(event) {

    if (tokenInserted) {
        return;
    }


    tokenIsDragging = true;


    startPointerX =
        event.clientX - tokenMoveX;

    startPointerY =
        event.clientY - tokenMoveY;


    token.classList.add("dragging");


    /*
       Hace que sigamos recibiendo
       movimiento aunque el cursor
       salga momentáneamente del token.
    */

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
        event.clientX - startPointerX;

    tokenMoveY =
        event.clientY - startPointerY;


    token.style.transform =
        `translate(
            ${tokenMoveX}px,
            ${tokenMoveY}px
        )`;


    /*
       Pequeña reacción cuando estamos
       sobre la ranura correcta.
    */

    if (tokenIsOverSlot()) {

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


    token.releasePointerCapture(
        event.pointerId
    );


    /*
       Si llegó a la ranura,
       la máquina lo acepta.
    */

    if (tokenIsOverSlot()) {

        insertToken();

        return;
    }


    /*
       Si lo soltamos en otro sitio,
       vuelve a su posición original.
    */

    returnTokenHome();

}


/* =========================================
   DEVOLVER TOKEN A SU SITIO
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


    /*
       Posición actual.
    */

    const tokenRect =
        token.getBoundingClientRect();

    const slotRect =
        tokenSlot.getBoundingClientRect();


    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    const slotCenterX =
        slotRect.left +
        slotRect.width / 2;

    const slotCenterY =
        slotRect.top +
        slotRect.height / 2;


    /*
       Calculamos cuánto debe desplazarse
       desde donde lo soltamos hasta
       el centro de la ranura.
    */

    const finalX =
        tokenMoveX +
        (slotCenterX - tokenCenterX);

    const finalY =
        tokenMoveY +
        (slotCenterY - tokenCenterY);


    /*
       Animación de absorción.
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
                        scale(0.72)`,

                    opacity: 1,

                    offset: 0.65
                },

                {
                    transform:
                        `translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.12)`,

                    opacity: 0
                }
            ],
            {
                duration: 520,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)",

                fill: "forwards"
            }
        );


    animation.onfinish = () => {

        token.style.visibility =
            "hidden";


        /*
           A partir de aquí la máquina
           ya tiene un token.

           En el siguiente paso utilizaremos
           esta variable para permitir
           girar la perilla.
        */

        console.log(
            "Token insertado 🍒"
        );

        console.log(
            "Perilla lista para activarse."
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
