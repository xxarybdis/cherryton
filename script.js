/* =========================================
   CHERRYTON GACHA
   SCRIPT.JS
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const machine = document.querySelector(".machine-wrap");
const capsules = document.querySelectorAll(".capsule");
const knob = document.querySelector(".knob");

const tokenOrder = [
    document.querySelector(".token-1"),
    document.querySelector(".token-2"),
    document.querySelector(".token-3"),
    document.querySelector(".token-4"),
    document.querySelector(".token-5")
];


/* =========================================
   RANURA DEL TOKEN
   ========================================= */

const TOKEN_SLOT_X = 0.32;
const TOKEN_SLOT_Y = 0.695;

const TOKEN_SLOT_RADIUS_X = 0.055;
const TOKEN_SLOT_RADIUS_Y = 0.045;


/* =========================================
   SALIDA DE LA CÁPSULA
   ========================================= */

/*
   Esta es la salida suavizada.

   La cápsula ya no se va tan abajo
   ni sale disparada.
*/

const DISPENSER_X = 62;
const DISPENSER_Y = 70;

const DISPENSED_CAPSULE_WIDTH = 10;

const CAPSULE_MOVE_X = -26;
const CAPSULE_MOVE_Y = 20;


/* =========================================
   TAMAÑOS
   ========================================= */

const CENTER_CAPSULE_SIZE = 34;

/*
   Resultado abierto más grande.
*/

const OPENED_RESULT_SIZE = 58;

/*
   Resultado final de la carta.
*/

const FINAL_LETTER_SIZE = 62;


/* =========================================
   TIEMPOS
   ========================================= */

const CAPSULE_EMERGE_TIME = 2000;

const RARITY_TIME = 1700;


/* =========================================
   SOMBRA
   ========================================= */

const RESULT_DROP_SHADOW =
    "drop-shadow(0 10px 18px rgba(0, 0, 0, 0.75))";


/* =========================================
   ESTADO
   ========================================= */

let machineIsRunning = false;

let tokenInserted = false;
let tokenIsDragging = false;

let knobIsTurning = false;

let dispensedCapsule = null;

let capsuleShakeAnimation = null;

let capsuleCanOpen = false;
let capsuleIsOpening = false;

let capsuleCanClose = false;
let capsuleIsClosing = false;

let currentGachaResult = null;

let rarityImage = null;

let letterCanRevealFinal = false;


/* =========================================
   TOKEN ACTUAL
   ========================================= */

let currentTokenIndex = 0;

let currentToken =
    tokenOrder[currentTokenIndex];


/* =========================================
   RESULTADOS
   ========================================= */

const NORMAL_GACHA_CAPSULES = [

    {
        name: "dog",
        closed: "assets/capsule-dog.png",
        rarity: "assets/normal.png",
        opened: "assets/capsule-dog2.png"
    },

    {
        name: "cat",
        closed: "assets/capsule-cat.png",
        rarity: "assets/normal.png",
        opened: "assets/capsule-cat2.png"
    },

    {
        name: "candy",
        closed: "assets/capsule-candy.png",
        rarity: "assets/normal.png",
        opened: "assets/capsule-candy2.png"
    },

    {
        name: "friends",
        closed: "assets/capsule-friends.png",
        rarity: "assets/rare.png",
        opened: "assets/capsule-friends2.png"
    }

];


const LETTER_CAPSULE = {

    name: "letter",

    closed: "assets/capsule-letter.png",

    rarity: "assets/ultra-rare.png",

    opened: "assets/capsule-letter2.png",

    final: "assets/capsule-letter3.png"

};


/* =========================================
   MEZCLAR RESULTADOS
   ========================================= */

function shuffleArray(array) {

    const copy = [...array];

    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            copy[i],
            copy[j]
        ] = [
            copy[j],
            copy[i]
        ];

    }

    return copy;

}


const gachaQueue = [

    ...shuffleArray(
        NORMAL_GACHA_CAPSULES
    ),

    LETTER_CAPSULE

];


/* =========================================
   ACTIVAR TOKEN
   ========================================= */

function activateCurrentToken() {

    tokenOrder.forEach(token => {

        if (!token) {
            return;
        }

        token.classList.remove(
            "active-token"
        );

    });


    currentToken =
        tokenOrder[currentTokenIndex];


    if (!currentToken) {

        knob.classList.remove(
            "ready"
        );

        knob.classList.add(
            "locked"
        );

        return;
    }


    currentToken.classList.add(
        "active-token"
    );

}


/* =========================================
   POSICIÓN DE LA RANURA
   ========================================= */

function getSlotPosition() {

    const machineRect =
        machine.getBoundingClientRect();


    return {

        x:
            machineRect.left +
            machineRect.width *
            TOKEN_SLOT_X,

        y:
            machineRect.top +
            machineRect.height *
            TOKEN_SLOT_Y,

        radiusX:
            machineRect.width *
            TOKEN_SLOT_RADIUS_X,

        radiusY:
            machineRect.height *
            TOKEN_SLOT_RADIUS_Y

    };

}


/* =========================================
   DISTANCIA TOKEN → RANURA
   ========================================= */

function getTokenSlotDistance(token) {

    const tokenRect =
        token.getBoundingClientRect();

    const slot =
        getSlotPosition();


    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    const dx =
        tokenCenterX -
        slot.x;

    const dy =
        tokenCenterY -
        slot.y;


    const normalizedDistance =
        Math.sqrt(

            Math.pow(
                dx / slot.radiusX,
                2
            )

            +

            Math.pow(
                dy / slot.radiusY,
                2
            )

        );


    return {

        distance:
            normalizedDistance,

        dx,

        dy,

        slot

    };

}


/* =========================================
   TOKEN DRAG
   ========================================= */

let tokenPointerId = null;

let tokenStartPointerX = 0;
let tokenStartPointerY = 0;

let tokenMoveX = 0;
let tokenMoveY = 0;


function tokenPointerDown(event) {

    if (
        !currentToken ||
        event.currentTarget !== currentToken ||
        machineIsRunning ||
        tokenInserted
    ) {
        return;
    }


    tokenIsDragging = true;

    tokenPointerId =
        event.pointerId;


    tokenStartPointerX =
        event.clientX;

    tokenStartPointerY =
        event.clientY;


    tokenMoveX = 0;
    tokenMoveY = 0;


    currentToken.classList.add(
        "dragging"
    );


    currentToken.setPointerCapture(
        event.pointerId
    );


    event.preventDefault();

}


function tokenPointerMove(event) {

    if (
        !tokenIsDragging ||
        !currentToken ||
        event.pointerId !== tokenPointerId
    ) {
        return;
    }


    tokenMoveX =
        event.clientX -
        tokenStartPointerX;

    tokenMoveY =
        event.clientY -
        tokenStartPointerY;


    currentToken.style.translate =
        `${tokenMoveX}px ${tokenMoveY}px`;


    const info =
        getTokenSlotDistance(
            currentToken
        );


    const shrinkDistance =
        Math.min(
            info.distance,
            2.2
        );


    const closeness =
        1 -
        Math.min(
            shrinkDistance / 2.2,
            1
        );


    const tokenScale =
        1 -
        closeness * 0.45;


    currentToken.style.scale =
        tokenScale;


    if (
        info.distance <= 1.4
    ) {

        currentToken.classList.add(
            "near-slot"
        );

    }
    else {

        currentToken.classList.remove(
            "near-slot"
        );

    }


    event.preventDefault();

}


function tokenPointerUp(event) {

    if (
        !tokenIsDragging ||
        !currentToken
    ) {
        return;
    }


    tokenIsDragging = false;


    currentToken.classList.remove(
        "dragging"
    );


    const info =
        getTokenSlotDistance(
            currentToken
        );


    if (
        info.distance <= 1
    ) {

        insertToken(
            currentToken
        );

    }
    else {

        returnToken(
            currentToken
        );

    }


    tokenPointerId = null;

}


/* =========================================
   REGRESAR TOKEN
   ========================================= */

function returnToken(token) {

    token.classList.remove(
        "near-slot"
    );


    const animation =
        token.animate(

            [

                {
                    translate:
                        `${tokenMoveX}px ${tokenMoveY}px`,

                    scale:
                        token.style.scale || 1
                },

                {
                    translate:
                        "0px 0px",

                    scale:
                        1
                }

            ],

            {
                duration:
                    450,

                easing:
                    "cubic-bezier(.2,.8,.2,1)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            token.style.translate =
                "0px 0px";

            token.style.scale =
                "1";

            animation.cancel();

        };

}


/* =========================================
   INSERTAR TOKEN
   ========================================= */

function insertToken(token) {

    tokenInserted = true;


    token.classList.remove(
        "near-slot"
    );

    token.classList.remove(
        "active-token"
    );


    const tokenRect =
        token.getBoundingClientRect();

    const slot =
        getSlotPosition();


    const tokenCenterX =
        tokenRect.left +
        tokenRect.width / 2;

    const tokenCenterY =
        tokenRect.top +
        tokenRect.height / 2;


    const moveX =
        slot.x -
        tokenCenterX;

    const moveY =
        slot.y -
        tokenCenterY;


    const animation =
        token.animate(

            [

                {
                    translate:
                        `${tokenMoveX}px ${tokenMoveY}px`,

                    scale:
                        token.style.scale || 1,

                    opacity:
                        1
                },

                {
                    translate:
                        `${
                            tokenMoveX +
                            moveX
                        }px ${
                            tokenMoveY +
                            moveY
                        }px`,

                    scale:
                        0.12,

                    opacity:
                        0
                }

            ],

            {
                duration:
                    620,

                easing:
                    "cubic-bezier(.3,.8,.25,1)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            token.classList.add(
                "used-token"
            );


            token.style.opacity =
                "0";


            knob.classList.remove(
                "locked"
            );

            knob.classList.add(
                "ready"
            );

        };

}


/* =========================================
   EVENTOS TOKENS
   ========================================= */

tokenOrder.forEach(token => {

    if (!token) {
        return;
    }


    token.addEventListener(
        "pointerdown",
        tokenPointerDown
    );

    token.addEventListener(
        "pointermove",
        tokenPointerMove
    );

    token.addEventListener(
        "pointerup",
        tokenPointerUp
    );

    token.addEventListener(
        "pointercancel",
        tokenPointerUp
    );

});


/* =========================================
   PERILLA MANUAL
   ========================================= */

let knobPointerId = null;

let knobPreviousPointerAngle = 0;

let knobRotation = 0;

let knobTurnCompleted = false;


/*
   La perilla debe girarse manualmente.

   Al llegar casi a la vuelta completa,
   termina suavemente el pequeño
   tramo restante.
*/

const KNOB_TRIGGER_ROTATION = -300;
const KNOB_FINAL_ROTATION = -360;


/* =========================================
   ÁNGULO ALREDEDOR DE LA PERILLA
   ========================================= */

function getPointerAngleAroundKnob(
    clientX,
    clientY
) {

    const rect =
        knob.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;


    return (

        Math.atan2(
            clientY - centerY,
            clientX - centerX
        )

        *

        180 /
        Math.PI

    );

}


function normalizeAngleDifference(
    difference
) {

    while (
        difference > 180
    ) {

        difference -= 360;

    }


    while (
        difference < -180
    ) {

        difference += 360;

    }


    return difference;

}


/* =========================================
   EMPEZAR GIRO
   ========================================= */

function knobPointerDown(event) {

    if (
        !tokenInserted ||
        machineIsRunning ||
        knobIsTurning
    ) {
        return;
    }


    knobIsTurning = true;

    knobTurnCompleted = false;

    knobPointerId =
        event.pointerId;


    knobPreviousPointerAngle =
        getPointerAngleAroundKnob(
            event.clientX,
            event.clientY
        );


    knob.classList.remove(
        "ready"
    );

    knob.classList.add(
        "turning"
    );


    knob.setPointerCapture(
        event.pointerId
    );


    event.preventDefault();

}


/* =========================================
   MOVER PERILLA
   ========================================= */

function knobPointerMove(event) {

    if (
        !knobIsTurning ||
        knobTurnCompleted ||
        event.pointerId !== knobPointerId
    ) {
        return;
    }


    const currentAngle =
        getPointerAngleAroundKnob(
            event.clientX,
            event.clientY
        );


    let difference =
        currentAngle -
        knobPreviousPointerAngle;


    difference =
        normalizeAngleDifference(
            difference
        );


    /*
       Solo giro antihorario.
    */

    if (
        difference < 0
    ) {

        knobRotation +=
            difference;


        knobRotation =
            Math.max(
                KNOB_FINAL_ROTATION,
                knobRotation
            );


        knob.style.transform =
            `translate(-50%, -50%) rotate(${knobRotation}deg)`;

    }


    knobPreviousPointerAngle =
        currentAngle;


    if (
        knobRotation <=
        KNOB_TRIGGER_ROTATION
    ) {

        completeKnobTurn();

    }


    event.preventDefault();

}


/* =========================================
   SOLTAR PERILLA
   ========================================= */

function knobPointerUp(event) {

    if (
        event.pointerId !==
        knobPointerId
    ) {
        return;
    }


    if (
        knobTurnCompleted
    ) {

        knobPointerId =
            null;

        return;

    }


    knobPointerId =
        null;


    knobIsTurning =
        false;


    knob.classList.remove(
        "turning"
    );


    returnKnobToStart();

}


/* =========================================
   REGRESAR PERILLA
   ========================================= */

function returnKnobToStart() {

    const startRotation =
        knobRotation;


    const animation =
        knob.animate(

            [

                {
                    transform:
                        `translate(-50%, -50%) rotate(${startRotation}deg)`
                },

                {
                    transform:
                        "translate(-50%, -50%) rotate(0deg)"
                }

            ],

            {
                duration:
                    320,

                easing:
                    "cubic-bezier(.25,.8,.25,1)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            knobRotation =
                0;


            knob.style.transform =
                "translate(-50%, -50%) rotate(0deg)";


            animation.cancel();


            if (
                tokenInserted &&
                !machineIsRunning
            ) {

                knob.classList.add(
                    "ready"
                );

            }

        };

}


/* =========================================
   COMPLETAR GIRO
   ========================================= */

function completeKnobTurn() {

    if (
        knobTurnCompleted
    ) {
        return;
    }


    knobTurnCompleted =
        true;

    machineIsRunning =
        true;


    const startRotation =
        knobRotation;


    const animation =
        knob.animate(

            [

                {
                    transform:
                        `translate(-50%, -50%) rotate(${startRotation}deg)`
                },

                {
                    transform:
                        `translate(-50%, -50%) rotate(${KNOB_FINAL_ROTATION}deg)`
                }

            ],

            {
                duration:
                    180,

                easing:
                    "ease-out",

                fill:
                    "forwards"
            }

        );


    /*
       Movimiento ligero de las cápsulas
       dentro de la máquina.
    */

    animateCapsulesInside();


    animation.onfinish =
        () => {

            knobRotation =
                KNOB_FINAL_ROTATION;


            knob.style.transform =
                `translate(-50%, -50%) rotate(${KNOB_FINAL_ROTATION}deg)`;


            animation.cancel();


            knob.classList.remove(
                "turning"
            );

            knob.classList.add(
                "locked"
            );


            knobIsTurning =
                false;


            setTimeout(

                () => {

                    dispenseCapsule();

                },

                160

            );

        };

}


/* =========================================
   EVENTOS PERILLA
   ========================================= */

knob.addEventListener(
    "pointerdown",
    knobPointerDown
);

knob.addEventListener(
    "pointermove",
    knobPointerMove
);

knob.addEventListener(
    "pointerup",
    knobPointerUp
);

knob.addEventListener(
    "pointercancel",
    knobPointerUp
);


/* =========================================
   RESETEAR PERILLA
   ========================================= */

function resetKnobPosition() {

    knobRotation =
        0;

    knobTurnCompleted =
        false;

    knobIsTurning =
        false;


    knob.style.transform =
        "translate(-50%, -50%) rotate(0deg)";

}


/* =========================================
   CÁPSULAS INTERNAS
   MOVIMIENTO SUAVE
   ========================================= */

function animateCapsulesInside() {

    capsules.forEach(
        (capsule, index) => {

            const direction =
                index % 2 === 0
                    ? 1
                    : -1;


            /*
               Movimiento pequeño.
               No las avienta.
            */

            const amountX =
                1.5 +
                Math.random() * 2;

            const amountY =
                1 +
                Math.random() * 1.5;


            capsule.animate(

                [

                    {
                        translate:
                            "0px 0px"
                    },

                    {
                        offset:
                            0.30,

                        translate:
                            `${
                                direction *
                                amountX
                            }px ${
                                -amountY
                            }px`
                    },

                    {
                        offset:
                            0.62,

                        translate:
                            `${
                                -direction *
                                amountX
                            }px ${
                                amountY *
                                0.5
                            }px`
                    },

                    {
                        translate:
                            "0px 0px"
                    }

                ],

                {
                    duration:
                        1000 +
                        Math.random() * 180,

                    easing:
                        "ease-in-out",

                    iterations:
                        1
                }

            );

        }

    );

}


/* =========================================
   RESULTADO ACTUAL
   ========================================= */

function getCurrentResult() {

    return (
        gachaQueue[
            currentTokenIndex
        ]
    );

}


/* =========================================
   DISPENSAR CÁPSULA
   ========================================= */

function dispenseCapsule() {

    currentGachaResult =
        getCurrentResult();


    dispensedCapsule =
        document.createElement(
            "img"
        );


    dispensedCapsule.src =
        currentGachaResult.closed;


    dispensedCapsule.alt =
        "";


    dispensedCapsule.draggable =
        false;


    Object.assign(

        dispensedCapsule.style,

        {

            position:
                "absolute",

            zIndex:
                "200",

            left:
                `${DISPENSER_X}%`,

            top:
                `${DISPENSER_Y}%`,

            width:
                `${DISPENSED_CAPSULE_WIDTH}%`,

            height:
                "auto",

            transform:
                "translate(-50%, -50%)",

            transformOrigin:
                "center center",

            userSelect:
                "none",

            WebkitUserDrag:
                "none",

            cursor:
                "default",

            willChange:
                "left, top, width, transform, opacity"

        }

    );


    machine.appendChild(
        dispensedCapsule
    );


    /*
       SALIDA SUAVE

       Primero aparece en la compuerta,
       hace un recorrido corto y después
       va al centro.

       No baja hasta fuera de la máquina.
    */

    const emergeAnimation =
        dispensedCapsule.animate(

            [

                {
                    left:
                        `${DISPENSER_X}%`,

                    top:
                        `${DISPENSER_Y}%`,

                    width:
                        `${DISPENSED_CAPSULE_WIDTH}%`,

                    transform:
                        "translate(-50%, -50%) scale(0.82)",

                    opacity:
                        0
                },

                {
                    offset:
                        0.15,

                    left:
                        `${DISPENSER_X}%`,

                    top:
                        `${DISPENSER_Y}%`,

                    width:
                        `${DISPENSED_CAPSULE_WIDTH}%`,

                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                },

                {
                    offset:
                        0.42,

                    left:
                        `${
                            DISPENSER_X +
                            CAPSULE_MOVE_X
                        }%`,

                    top:
                        `${
                            DISPENSER_Y +
                            CAPSULE_MOVE_Y
                        }%`,

                    width:
                        `${DISPENSED_CAPSULE_WIDTH}%`,

                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                },

                {
                    left:
                        "50%",

                    top:
                        "50%",

                    width:
                        `${CENTER_CAPSULE_SIZE}%`,

                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                }

            ],

            {
                duration:
                    CAPSULE_EMERGE_TIME,

                easing:
                    "cubic-bezier(.18,.75,.25,1)",

                fill:
                    "forwards"
            }

        );


    emergeAnimation.onfinish =
        () => {

            dispensedCapsule.style.left =
                "50%";

            dispensedCapsule.style.top =
                "50%";

            dispensedCapsule.style.width =
                `${CENTER_CAPSULE_SIZE}%`;

            dispensedCapsule.style.transform =
                "translate(-50%, -50%)";


            emergeAnimation.cancel();


            startCapsuleShake();

        };

}


/* =========================================
   SHAKE CÁPSULA
   ========================================= */

function startCapsuleShake() {

    if (!dispensedCapsule) {
        return;
    }


    capsuleShakeAnimation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) translateX(-6px) rotate(-2.5deg)"
                },

                {
                    transform:
                        "translate(-50%, -50%) translateX(6px) rotate(2.5deg)"
                },

                {
                    transform:
                        "translate(-50%, -50%) translateX(-6px) rotate(-2.5deg)"
                }

            ],

            {
                duration:
                    1300,

                easing:
                    "ease-in-out",

                iterations:
                    Infinity
            }

        );


    capsuleCanOpen =
        true;


    dispensedCapsule.style.cursor =
        "pointer";


    dispensedCapsule.addEventListener(
        "click",
        capsuleClickHandler
    );

}


/* =========================================
   CLICK CÁPSULA
   ========================================= */

function capsuleClickHandler() {

    if (
        !dispensedCapsule ||
        capsuleIsOpening ||
        capsuleIsClosing
    ) {
        return;
    }


    if (
        currentGachaResult.name ===
        "letter"
    ) {

        handleLetterCapsule();

        return;

    }


    if (
        capsuleCanOpen
    ) {

        openNormalCapsule();

        return;

    }


    if (
        capsuleCanClose
    ) {

        closeResult();

    }

}


/* =========================================
   ABRIR NORMAL / RARE
   ========================================= */

function openNormalCapsule() {

    capsuleCanOpen =
        false;

    capsuleIsOpening =
        true;


    stopCapsuleShake();


    const animation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) scale(1)"
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(0.72)"
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(0)"
                }

            ],

            {
                duration:
                    320,

                easing:
                    "ease-in",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            dispensedCapsule.style.opacity =
                "0";


            showRarity(

                currentGachaResult.rarity,

                () => {

                    revealOpenedResult(
                        currentGachaResult.opened
                    );

                }

            );

        };

}


/* =========================================
   RAREZA
   ========================================= */

function showRarity(
    imageSource,
    callback
) {

    rarityImage =
        document.createElement(
            "img"
        );


    rarityImage.src =
        imageSource;


    rarityImage.alt =
        "";


    Object.assign(

        rarityImage.style,

        {

            position:
                "absolute",

            zIndex:
                "400",

            left:
                "50%",

            top:
                "50%",

            width:
                "36%",

            height:
                "auto",

            transform:
                "translate(-50%, -50%) scale(0)",

            transformOrigin:
                "center center",

            pointerEvents:
                "none",

            userSelect:
                "none",

            WebkitUserDrag:
                "none"

        }

    );


    machine.appendChild(
        rarityImage
    );


    rarityImage.animate(

        [

            {
                transform:
                    "translate(-50%, -50%) scale(0)",

                opacity:
                    0
            },

            {
                offset:
                    0.55,

                transform:
                    "translate(-50%, -50%) scale(1.16)",

                opacity:
                    1
            },

            {
                transform:
                    "translate(-50%, -50%) scale(1)",

                opacity:
                    1
            }

        ],

        {
            duration:
                480,

            easing:
                "cubic-bezier(.15,.9,.25,1.35)",

            fill:
                "forwards"
        }

    );


    setTimeout(

        () => {

            const disappear =
                rarityImage.animate(

                    [

                        {
                            opacity:
                                1,

                            transform:
                                "translate(-50%, -50%) scale(1)"
                        },

                        {
                            opacity:
                                0,

                            transform:
                                "translate(-50%, -50%) scale(0.9)"
                        }

                    ],

                    {
                        duration:
                            280,

                        easing:
                            "ease-in",

                        fill:
                            "forwards"
                    }

                );


            disappear.onfinish =
                () => {

                    if (
                        rarityImage &&
                        rarityImage.parentNode
                    ) {

                        rarityImage.remove();

                    }


                    rarityImage =
                        null;


                    if (callback) {
                        callback();
                    }

                };

        },

        RARITY_TIME

    );

}


/* =========================================
   RESULTADO ABIERTO
   ========================================= */

function revealOpenedResult(
    imageSource
) {

    if (!dispensedCapsule) {
        return;
    }


    dispensedCapsule.src =
        imageSource;


    dispensedCapsule.style.opacity =
        "1";


    dispensedCapsule.style.width =
        `${OPENED_RESULT_SIZE}%`;


    dispensedCapsule.style.filter =
        RESULT_DROP_SHADOW;


    dispensedCapsule.style.cursor =
        "pointer";


    const animation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) scale(0.15)",

                    opacity:
                        0
                },

                {
                    offset:
                        0.65,

                    transform:
                        "translate(-50%, -50%) scale(1.08)",

                    opacity:
                        1
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                }

            ],

            {
                duration:
                    650,

                easing:
                    "cubic-bezier(.15,.85,.2,1.15)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            dispensedCapsule.style.transform =
                "translate(-50%, -50%)";


            animation.cancel();


            capsuleIsOpening =
                false;

            capsuleCanClose =
                true;

        };

}


/* =========================================
   CARTA
   ========================================= */

function handleLetterCapsule() {

    if (
        capsuleCanOpen
    ) {

        capsuleCanOpen =
            false;

        capsuleIsOpening =
            true;


        stopCapsuleShake();


        const animation =
            dispensedCapsule.animate(

                [

                    {
                        transform:
                            "translate(-50%, -50%) scale(1)",

                        opacity:
                            1
                    },

                    {
                        transform:
                            "translate(-50%, -50%) scale(0)",

                        opacity:
                            0
                    }

                ],

                {
                    duration:
                        320,

                    easing:
                        "ease-in",

                    fill:
                        "forwards"
                }

            );


        animation.onfinish =
            () => {

                dispensedCapsule.style.opacity =
                    "0";


                showRarity(

                    LETTER_CAPSULE.rarity,

                    revealLetterSecondStage

                );

            };


        return;

    }


    if (
        letterCanRevealFinal
    ) {

        revealLetterFinal();

        return;

    }


    if (
        capsuleCanClose
    ) {

        closeResult();

    }

}


/* =========================================
   LETTER 2
   ========================================= */

function revealLetterSecondStage() {

    if (!dispensedCapsule) {
        return;
    }


    dispensedCapsule.src =
        LETTER_CAPSULE.opened;


    dispensedCapsule.style.opacity =
        "1";


    dispensedCapsule.style.width =
        `${OPENED_RESULT_SIZE}%`;


    dispensedCapsule.style.filter =
        RESULT_DROP_SHADOW;


    const animation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) scale(0.12)",

                    opacity:
                        0
                },

                {
                    offset:
                        0.65,

                    transform:
                        "translate(-50%, -50%) scale(1.08)",

                    opacity:
                        1
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                }

            ],

            {
                duration:
                    700,

                easing:
                    "cubic-bezier(.15,.85,.2,1.15)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            dispensedCapsule.style.transform =
                "translate(-50%, -50%)";


            animation.cancel();


            capsuleIsOpening =
                false;

            letterCanRevealFinal =
                true;

            capsuleCanClose =
                false;

        };

}


/* =========================================
   LETTER 3
   ========================================= */

function revealLetterFinal() {

    if (!dispensedCapsule) {
        return;
    }


    letterCanRevealFinal =
        false;


    dispensedCapsule.src =
        LETTER_CAPSULE.final;


    dispensedCapsule.style.width =
        `${FINAL_LETTER_SIZE}%`;


    dispensedCapsule.style.filter =
        RESULT_DROP_SHADOW;


    const animation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) scale(0.82)",

                    opacity:
                        0.5
                },

                {
                    offset:
                        0.62,

                    transform:
                        "translate(-50%, -50%) scale(1.08)",

                    opacity:
                        1
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                }

            ],

            {
                duration:
                    650,

                easing:
                    "cubic-bezier(.15,.85,.2,1.15)",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            dispensedCapsule.style.transform =
                "translate(-50%, -50%)";


            animation.cancel();


            capsuleCanClose =
                true;

        };

}


/* =========================================
   DETENER SHAKE
   ========================================= */

function stopCapsuleShake() {

    if (
        capsuleShakeAnimation
    ) {

        capsuleShakeAnimation.cancel();

        capsuleShakeAnimation =
            null;

    }


    if (
        dispensedCapsule
    ) {

        dispensedCapsule.style.transform =
            "translate(-50%, -50%)";

    }

}


/* =========================================
   CERRAR RESULTADO
   ========================================= */

function closeResult() {

    if (
        !dispensedCapsule ||
        capsuleIsClosing
    ) {
        return;
    }


    capsuleIsClosing =
        true;

    capsuleCanClose =
        false;

    letterCanRevealFinal =
        false;


    const animation =
        dispensedCapsule.animate(

            [

                {
                    transform:
                        "translate(-50%, -50%) scale(1)",

                    opacity:
                        1
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(0.85)",

                    opacity:
                        0
                }

            ],

            {
                duration:
                    350,

                easing:
                    "ease-in",

                fill:
                    "forwards"
            }

        );


    animation.onfinish =
        () => {

            if (
                dispensedCapsule &&
                dispensedCapsule.parentNode
            ) {

                dispensedCapsule.remove();

            }


            dispensedCapsule =
                null;


            resetAfterResult();

        };

}


/* =========================================
   SIGUIENTE TURNO
   ========================================= */

function resetAfterResult() {

    capsuleCanOpen =
        false;

    capsuleIsOpening =
        false;

    capsuleCanClose =
        false;

    capsuleIsClosing =
        false;

    machineIsRunning =
        false;

    knobIsTurning =
        false;

    tokenInserted =
        false;

    currentGachaResult =
        null;

    letterCanRevealFinal =
        false;


    resetKnobPosition();


    unlockNextToken();

}


/* =========================================
   SIGUIENTE TOKEN
   ========================================= */

function unlockNextToken() {

    currentTokenIndex++;


    if (
        currentTokenIndex >=
        tokenOrder.length
    ) {

        currentToken =
            null;


        knob.classList.remove(
            "ready"
        );

        knob.classList.add(
            "locked"
        );


        return;

    }


    currentToken =
        tokenOrder[
            currentTokenIndex
        ];


    currentToken.classList.add(
        "active-token"
    );


    knob.classList.remove(
        "ready"
    );

    knob.classList.add(
        "locked"
    );

}


/* =========================================
   INICIO
   ========================================= */

resetKnobPosition();

activateCurrentToken();
