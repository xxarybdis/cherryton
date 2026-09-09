/* =========================================
   CHERRYTON GACHA
   Movimiento fluido de cápsulas
   ========================================= */

const machine = document.querySelector(".machine-wrap");
const capsules = document.querySelectorAll(".capsule");

let machineIsRunning = false;


/* =========================================
   NÚMERO ALEATORIO
   ========================================= */

function random(min, max) {
    return Math.random() * (max - min) + min;
}


/* =========================================
   LÍMITES DE MOVIMIENTO
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

    /* Cápsulas interiores */
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

    const limits = getCapsuleLimits(capsule);


    /*
       En vez de muchos golpes rápidos,
       hacemos pocos movimientos largos.
    */

    const x1 = random(limits.left, limits.right);
    const y1 = random(-limits.up, -2);

    const x2 = random(limits.left, limits.right);
    const y2 = random(-limits.up * 0.55, limits.down);

    const x3 = random(limits.left, limits.right);
    const y3 = random(-limits.up * 0.75, limits.down);


    /*
       Rotaciones pequeñas.

       Esto hace que parezcan cápsulas
       pesadas en vez de objetos vibrando.
    */

    const r1 = random(-9, 9);
    const r2 = random(-12, 12);
    const r3 = random(-7, 7);


    /*
       Cada cápsula se mueve a una
       velocidad ligeramente diferente.
    */

    const duration = random(1900, 2400);

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
                translate: `${x1}px ${y1}px`,
                rotate: `${r1}deg`,
                offset: 0.28
            },

            {
                translate: `${x2}px ${y2}px`,
                rotate: `${r2}deg`,
                offset: 0.55
            },

            {
                translate: `${x3}px ${y3}px`,
                rotate: `${r3}deg`,
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

            /*
               Solo un ciclo largo.
               Nada de repetir el mismo
               movimiento tres veces.
            */
            iterations: 1,

            delay: delay,

            /*
               Esta curva hace que aceleren
               y desaceleren suavemente.
            */
            easing: "cubic-bezier(0.45, 0, 0.25, 1)",

            fill: "none"
        }
    );
}


/* =========================================
   PEQUEÑO MOVIMIENTO DE LA MÁQUINA
   ========================================= */

function animateMachine() {

    /*
       La máquina apenas se balancea.
       Es MUY sutil para que no parezca
       un terremoto jajaja.
    */

    machine.animate(
        [
            {
                transform: "translateX(0px)"
            },

            {
                transform: "translateX(-1.5px)",
                offset: 0.25
            },

            {
                transform: "translateX(1.5px)",
                offset: 0.55
            },

            {
                transform: "translateX(-0.7px)",
                offset: 0.78
            },

            {
                transform: "translateX(0px)"
            }
        ],
        {
            duration: 2200,
            easing: "ease-in-out"
        }
    );
}


/* =========================================
   ACTIVAR GACHAPÓN
   ========================================= */

function runGacha() {

    if (machineIsRunning) {
        return;
    }

    machineIsRunning = true;


    /* Movimiento sutil de la máquina */
    animateMachine();


    /* Movimiento individual de cápsulas */
    capsules.forEach((capsule, index) => {

        animateCapsule(capsule, index);

    });


    /*
       Esperamos a que termine toda
       la animación antes de permitir
       otra activación.
    */

    setTimeout(() => {

        machineIsRunning = false;

    }, 2700);
}


/* =========================================
   ACTIVACIÓN TEMPORAL

   Seguimos usando clic en la máquina
   solamente para probar.
   ========================================= */

machine.addEventListener("click", runGacha);
