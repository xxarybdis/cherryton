/* =========================================
   CHERRYTON GACHA
   Animación segura de cápsulas
   ========================================= */

const machine = document.querySelector(".machine-wrap");
const capsuleArea = document.querySelector(".capsule-area");
const capsules = document.querySelectorAll(".capsule");

let machineIsRunning = false;


/* =========================================
   NÚMERO ALEATORIO
   ========================================= */

function random(min, max) {
    return Math.random() * (max - min) + min;
}


/* =========================================
   CONFIGURACIÓN POR CÁPSULA
   ========================================= */

/*
   Las cápsulas cercanas a los bordes
   reciben menos movimiento horizontal.

   capsule-1 es la conflictiva de abajo
   a la izquierda, así que la limitamos más.
*/

function getCapsuleLimits(capsule) {

    if (capsule.classList.contains("capsule-1")) {
        return {
            left: -2,
            right: 14,
            up: 20,
            down: 2
        };
    }

    if (capsule.classList.contains("capsule-6")) {
        return {
            left: -4,
            right: 16,
            up: 18,
            down: 5
        };
    }

    if (capsule.classList.contains("capsule-5")) {
        return {
            left: -14,
            right: 3,
            up: 18,
            down: 2
        };
    }

    if (capsule.classList.contains("capsule-9")) {
        return {
            left: -15,
            right: 5,
            up: 18,
            down: 5
        };
    }

    return {
        left: -18,
        right: 18,
        up: 22,
        down: 8
    };
}


/* =========================================
   ANIMAR UNA CÁPSULA
   ========================================= */

function animateCapsule(capsule, index) {

    const limits = getCapsuleLimits(capsule);

    /*
       Cada cápsula tiene su propio
       movimiento, pero respetando
       los límites asignados.
    */

    const x1 = random(limits.left, limits.right);
    const y1 = random(-limits.up, limits.down);

    const x2 = random(limits.left, limits.right);
    const y2 = random(-limits.up, limits.down);

    const x3 = random(limits.left, limits.right);
    const y3 = random(-limits.up, limits.down);

    const x4 = random(limits.left, limits.right);
    const y4 = random(-limits.up * 0.7, limits.down);


    /*
       Rotación independiente
    */

    const r1 = random(-22, 22);
    const r2 = random(-32, 32);
    const r3 = random(-26, 26);
    const r4 = random(-16, 16);


    /*
       Movimiento ligeramente desfasado
    */

    const delay = random(0, 100) + index * 8;
    const duration = random(650, 850);


    return capsule.animate(
        [
            {
                translate: "0px 0px",
                rotate: "0deg"
            },

            {
                translate: `${x1}px ${y1}px`,
                rotate: `${r1}deg`,
                offset: 0.20
            },

            {
                translate: `${x2}px ${y2}px`,
                rotate: `${r2}deg`,
                offset: 0.42
            },

            {
                translate: `${x3}px ${y3}px`,
                rotate: `${r3}deg`,
                offset: 0.64
            },

            {
                translate: `${x4}px ${y4}px`,
                rotate: `${r4}deg`,
                offset: 0.82
            },

            {
                translate: "0px 0px",
                rotate: "0deg"
            }
        ],
        {
            duration: duration,
            iterations: 3,
            delay: delay,
            easing: "ease-in-out",
            fill: "none"
        }
    );
}


/* =========================================
   ACTIVAR LA MÁQUINA
   ========================================= */

function runGacha() {

    if (machineIsRunning) {
        return;
    }

    machineIsRunning = true;

    capsules.forEach((capsule, index) => {
        animateCapsule(capsule, index);
    });

    setTimeout(() => {
        machineIsRunning = false;
    }, 3000);
}


/* =========================================
   PRUEBA TEMPORAL
   ========================================= */

machine.addEventListener("click", runGacha);
