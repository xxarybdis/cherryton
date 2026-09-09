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

const knob =
    document.querySelector(".knob");


/* =========================================
   ESTADO GENERAL
   ========================================= */

let machineIsRunning = false;

let tokenInserted = false;

let tokenIsDragging = false;

let knobIsTurning = false;


/* =========================================
   TOKEN - DATOS DE ARRASTRE
   ========================================= */

let startPointerX = 0;
let startPointerY = 0;

let tokenMoveX = 0;
let tokenMoveY = 0;

let tokenScale = 1;

const TOKEN_MIN_SCALE = 0.55;


/* =========================================
   PERILLA - DATOS DE GIRO
   ========================================= */

let knobRotation = 0;

let knobLastPointerAngle = 0;

const KNOB_REQUIRED_TURN = 280;


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
   UTILIDAD ALEATORIA
   ========================================= */

function random(min, max) {

    return Math.random() *
        (max - min) +
        min;

}


/* =========================================
   CÁPSULAS - LÍMITES
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
   CÁPSULAS - ANIMACIÓN
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
   TOKEN - POSICIÓN DE LA RANURA
   ========================================= */

function getTokenSlotPosition() {

    const machineRect =
        machine.getBoundingClientRect();


    return {

        x:
            machineRect.left +
            machineRect.width * 0.32,

        /*
           Antes: 0.71
           Ahora: 0.695

           Esto sube un poco el punto
           donde el token es absorbido.
        */

        y:
            machineRect.top +
            machineRect.height * 0.695,

        radiusX:
            machineRect.width * 0.055,

        radiusY:
            machineRect.height * 0.045

    };

}


/* =========================================
   TOKEN - CENTRO ACTUAL
   ========================================= */

function getTokenCenter() {

    const tokenRect =
        token.getBoundingClientRect();


    return {

        x:
            tokenRect.left +
            tokenRect.width / 2,

        y:
            tokenRect.top +
            tokenRect.height / 2

    };

}


/* =========================================
   TOKEN - DISTANCIA A LA RANURA
   ========================================= */

function getTokenDistanceFromSlot() {

    const tokenCenter =
        getTokenCenter();

    const slot =
        getTokenSlotPosition();


    const distanceX =
        tokenCenter.x -
        slot.x;

    const distanceY =
        tokenCenter.y -
        slot.y;


    return Math.sqrt(
        distanceX * distanceX +
        distanceY * distanceY
    );

}


/* =========================================
   TOKEN - CALCULAR TAMAÑO
   ========================================= */

function calculateTokenScale() {

    const machineRect =
        machine.getBoundingClientRect();


    const distance =
        getTokenDistanceFromSlot();


    const influenceDistance =
        machineRect.width * 0.23;


    if (
        distance >=
        influenceDistance
    ) {

        return 1;

    }


    const progress =
        distance /
        influenceDistance;


    return (
        TOKEN_MIN_SCALE +
        (
            1 -
            TOKEN_MIN_SCALE
        ) *
        progress
    );

}


/* =========================================
   TOKEN - APLICAR TRANSFORMACIÓN
   ========================================= */

function updateTokenTransform() {

    token.style.transform =
        `translate(
            ${tokenMoveX}px,
            ${tokenMoveY}px
        )
        scale(${tokenScale})`;

}


/* =========================================
   TOKEN - DETECCIÓN DE RANURA
   ========================================= */

function tokenIsNearSlot() {

    const tokenCenter =
        getTokenCenter();

    const slot =
        getTokenSlotPosition();


    const distanceX =
        Math.abs(
            tokenCenter.x -
            slot.x
        );

    const distanceY =
        Math.abs(
            tokenCenter.y -
            slot.y
        );


    return (
        distanceX <= slot.radiusX &&
        distanceY <= slot.radiusY
    );

}


/* =========================================
   TOKEN - AGARRAR
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
   TOKEN - MOVER
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


    tokenScale =
        calculateTokenScale();


    updateTokenTransform();


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
   TOKEN - SOLTAR
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
   TOKEN - REGRESAR
   ========================================= */

function returnTokenHome() {

    token.classList.remove(
        "near-slot"
    );


    const currentX =
        tokenMoveX;

    const currentY =
        tokenMoveY;

    const currentScale =
        tokenScale;


    const animation =
        token.animate(
            [
                {
                    transform:
                        `translate(
                            ${currentX}px,
                            ${currentY}px
                        )
                        scale(${currentScale})`
                },

                {
                    transform:
                        `translate(
                            0px,
                            0px
                        )
                        scale(1)`
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

        tokenScale = 1;

        updateTokenTransform();

    };

}


/* =========================================
   TOKEN - INSERTAR
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


    const startingScale =
        tokenScale;


    const animation =
        token.animate(
            [
                {
                    transform:
                        `translate(
                            ${tokenMoveX}px,
                            ${tokenMoveY}px
                        )
                        scale(${startingScale})`,

                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.35)`,

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


        knob.classList.remove(
            "locked"
        );

        knob.classList.add(
            "ready"
        );

    };

}


/* =========================================
   PERILLA - OBTENER ÁNGULO
   ========================================= */

function getPointerAngle(event) {

    const knobRect =
        knob.getBoundingClientRect();


    const centerX =
        knobRect.left +
        knobRect.width / 2;

    const centerY =
        knobRect.top +
        knobRect.height / 2;


    const radians =
        Math.atan2(
            event.clientY - centerY,
            event.clientX - centerX
        );


    return radians *
        180 / Math.PI;

}


/* =========================================
   PERILLA - EMPEZAR A GIRAR
   ========================================= */

function startKnobTurn(event) {

    if (!tokenInserted) {
        return;
    }


    if (machineIsRunning) {
        return;
    }


    knobIsTurning = true;

    knobRotation = 0;


    knobLastPointerAngle =
        getPointerAngle(event);


    knob.classList.add(
        "turning"
    );


    knob.setPointerCapture(
        event.pointerId
    );


    event.preventDefault();

}


/* =========================================
   PERILLA - GIRAR
   ========================================= */

function moveKnob(event) {

    if (!knobIsTurning) {
        return;
    }


    const currentAngle =
        getPointerAngle(event);


    let difference =
        currentAngle -
        knobLastPointerAngle;


    if (difference > 180) {
        difference -= 360;
    }

    if (difference < -180) {
        difference += 360;
    }


    knobRotation +=
        -difference;


    knobRotation =
        Math.max(
            0,
            knobRotation
        );


    knobRotation =
        Math.min(
            360,
            knobRotation
        );


    knob.style.transform =
        `translate(-50%, -50%)
         rotate(${-knobRotation}deg)`;


    knobLastPointerAngle =
        currentAngle;


    if (
        knobRotation >=
        KNOB_REQUIRED_TURN
    ) {

        completeKnobTurn(
            event.pointerId
        );

    }


    event.preventDefault();

}


/* =========================================
   PERILLA - SOLTAR ANTES
   ========================================= */

function endKnobTurn(event) {

    if (!knobIsTurning) {
        return;
    }


    knobIsTurning = false;


    knob.classList.remove(
        "turning"
    );


    if (
        knob.hasPointerCapture(
            event.pointerId
        )
    ) {

        knob.releasePointerCapture(
            event.pointerId
        );

    }


    resetKnob();

}


/* =========================================
   PERILLA - REGRESAR
   ========================================= */

function resetKnob() {

    const startingRotation =
        knobRotation;


    const animation =
        knob.animate(
            [
                {
                    transform:
                        `translate(-50%, -50%)
                         rotate(${-startingRotation}deg)`
                },

                {
                    transform:
                        `translate(-50%, -50%)
                         rotate(0deg)`
                }
            ],

            {
                duration: 450,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        );


    animation.onfinish = () => {

        knobRotation = 0;

        knob.style.transform =
            `translate(-50%, -50%)
             rotate(0deg)`;

    };

}


/* =========================================
   PERILLA - GIRO COMPLETADO
   ========================================= */

function completeKnobTurn(
    pointerId
) {

    knobIsTurning = false;


    knob.classList.remove(
        "turning"
    );


    if (
        knob.hasPointerCapture(
            pointerId
        )
    ) {

        knob.releasePointerCapture(
            pointerId
        );

    }


    tokenInserted = false;


    knob.classList.remove(
        "ready"
    );

    knob.classList.add(
        "locked"
    );


    const animation =
        knob.animate(
            [
                {
                    transform:
                        `translate(-50%, -50%)
                         rotate(${-knobRotation}deg)`
                },

                {
                    transform:
                        `translate(-50%, -50%)
                         rotate(-360deg)`
                }
            ],

            {
                duration: 220,

                easing:
                    "ease-out"
            }
        );


    animation.onfinish = () => {

        knobRotation = 0;

        knob.style.transform =
            `translate(-50%, -50%)
             rotate(0deg)`;

    };


    runGacha();

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


/* =========================================
   EVENTOS DE LA PERILLA
   ========================================= */

knob.addEventListener(
    "pointerdown",
    startKnobTurn
);

knob.addEventListener(
    "pointermove",
    moveKnob
);

knob.addEventListener(
    "pointerup",
    endKnobTurn
);

knob.addEventListener(
    "pointercancel",
    endKnobTurn
);
