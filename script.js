/* =========================================
   CHERRYTON GACHA
   Animación de cápsulas
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
   ANIMAR UNA CÁPSULA
   ========================================= */

function animateCapsule(capsule, index) {

    /*
       El movimiento se calcula según
       el tamaño actual del depósito.

       Así también funciona bien
       en celular.
    */

    const areaWidth = capsuleArea.clientWidth;
    const areaHeight = capsuleArea.clientHeight;

    /*
       Cada cápsula recibe una fuerza
       ligeramente diferente.
    */

    const strength = random(0.75, 1.15);

    const horizontal =
        areaWidth * 0.08 * strength;

    const vertical =
        areaHeight * 0.16 * strength;


    /*
       Creamos varios puntos de movimiento.

       No todas siguen exactamente
       la misma trayectoria.
    */

    const x1 = random(-horizontal, horizontal);
    const y1 = random(-vertical, -vertical * 0.35);

    const x2 = random(-horizontal, horizontal);
    const y2 = random(-vertical * 0.5, vertical * 0.35);

    const x3 = random(-horizontal, horizontal);
    const y3 = random(-vertical, vertical * 0.15);

    const x4 = random(-horizontal * 0.7, horizontal * 0.7);
    const y4 = random(-vertical * 0.5, vertical * 0.3);


    /*
       Rotaciones independientes.
    */

    const r1 = random(-25, 25);
    const r2 = random(-38, 38);
    const r3 = random(-30, 30);
    const r4 = random(-18, 18);


    /*
       Algunas cápsulas empiezan
       unas milésimas después que otras.

       Eso rompe el movimiento sincronizado.
    */

    const delay = random(0, 110) + index * 8;


    /*
       Duración diferente para cada cápsula.
    */

    const duration = random(650, 900);


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

            /*
               Importantísimo:
               al terminar vuelven exactamente
               a su posición original.
            */
            fill: "none"
        }
    );
}


/* =========================================
   ACTIVAR EL GACHAPÓN
   ========================================= */

function runGacha() {

    /*
       Evita activar la máquina
       diez veces a la vez.
    */

    if (machineIsRunning) {
        return;
    }

    machineIsRunning = true;


    /*
       Animamos cada cápsula
       de manera independiente.
    */

    capsules.forEach((capsule, index) => {
        animateCapsule(capsule, index);
    });


    /*
       Duración total aproximada
       del movimiento.
    */

    setTimeout(() => {

        machineIsRunning = false;

    }, 3000);
}


/* =========================================
   PRUEBA TEMPORAL

   Por ahora hacemos clic en cualquier
   parte de la máquina para activarla.

   Después esto se conectará
   exclusivamente con el token/perilla.
   ========================================= */

machine.addEventListener("click", runGacha);
