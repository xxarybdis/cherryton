/* =========================================
   CHERRYTON GACHA
   5 TOKENS / 5 CÁPSULAS
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

const tokens =
    Array.from(
        document.querySelectorAll(".token")
    );

const knob =
    document.querySelector(".knob");


/* =========================================
   ESTADO GENERAL
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


/*
   Para LETTER:

   closed
   ↓
   rarity
   ↓
   opened
   ↓ click
   final
   ↓ click
   cerrar
*/

let letterCanRevealFinal = false;


/* =========================================
   TOKENS
   ========================================= */

const tokenOrder = [

    document.querySelector(".token-1"),
    document.querySelector(".token-2"),
    document.querySelector(".token-3"),
    document.querySelector(".token-4"),
    document.querySelector(".token-5")

];


let currentTokenIndex = 0;

let currentToken =
    tokenOrder[currentTokenIndex];


/* =========================================
   TOKEN - ARRASTRE
   ========================================= */

let startPointerX = 0;
let startPointerY = 0;

let tokenMoveX = 0;
let tokenMoveY = 0;

let tokenScale = 1;

const TOKEN_MIN_SCALE = 0.55;


/* =========================================
   PERILLA
   ========================================= */

let knobRotation = 0;

let knobLastPointerAngle = 0;

const KNOB_REQUIRED_TURN = 280;


/* =========================================
   RESULTADOS NORMALES
   ========================================= */

const NORMAL_GACHA_CAPSULES = [

    {
        name: "dog",

        closed:
            "assets/capsule-dog.png",

        rarity:
            "assets/normal.png",

        opened:
            "assets/capsule-dog2.png"
    },

    {
        name: "cat",

        closed:
            "assets/capsule-cat.png",

        rarity:
            "assets/normal.png",

        opened:
            "assets/capsule-cat2.png"
    },

    {
        name: "candy",

        closed:
            "assets/capsule-candy.png",

        rarity:
            "assets/normal.png",

        opened:
            "assets/capsule-candy2.png"
    },

    {
        name: "friends",

        closed:
            "assets/capsule-friends.png",

        rarity:
            "assets/rare.png",

        opened:
            "assets/capsule-friends2.png"
    }

];


/* =========================================
   LETTER ESPECIAL
   ========================================= */

const LETTER_CAPSULE = {

    name:
        "letter",

    /*
       PRIMERO sale la cápsula normal.
    */

    closed:
        "assets/capsule-letter.png",

    /*
       Primer click.
    */

    rarity:
        "assets/ultra-rare.png",

    /*
       Después del letrero.
    */

    opened:
        "assets/capsule-letter2.png",

    /*
       Segundo click.
    */

    final:
        "assets/capsule-letter3.png"

};


/* =========================================
   COLA DE LA RONDA
   ========================================= */

let gachaQueue = [];


/* =========================================
   CREAR RONDA
   ========================================= */

function createNewGachaRound() {

    const shuffled =
        [...NORMAL_GACHA_CAPSULES];


    for (
        let i =
            shuffled.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];

    }


    /*
       LETTER siempre es la quinta.
    */

    gachaQueue = [

        ...shuffled,

        LETTER_CAPSULE

    ];

}


createNewGachaRound();


/* =========================================
   SIGUIENTE RESULTADO
   ========================================= */

function getNextGachaResult() {

    return gachaQueue.shift();

}


/* =========================================
   SALIDA DE CÁPSULA
   ========================================= */

/*
   VALORES CALIBRADOS.
*/

const DISPENSER_X = 62;

const DISPENSER_Y = 81;

const DISPENSED_CAPSULE_WIDTH = 10;

const CAPSULE_MOVE_X = -26;

const CAPSULE_MOVE_Y = 64;


/* =========================================
   CENTRO
   ========================================= */

const CENTER_CAPSULE_SIZE = 34;


/* =========================================
   RAREZA
   ========================================= */

const RARITY_DISPLAY_TIME = 1900;


/* =========================================
   ACTIVAR TOKEN
   ========================================= */

function activateCurrentToken() {

    tokens.forEach(
        token => {

            token.classList.remove(
                "active-token"
            );

        }
    );


    if (
        !currentToken
    ) {

        return;

    }


    currentToken.classList.add(
        "active-token"
    );

}


activateCurrentToken();


/* =========================================
   AJUSTAR MÁQUINA
   ========================================= */

function resizeMachine() {

    const naturalWidth =
        machineImage.naturalWidth;

    const naturalHeight =
        machineImage.naturalHeight;


    if (
        !naturalWidth ||
        !naturalHeight
    ) {

        return;

    }


    const isMobile =
        window.innerWidth <= 600;


    const maxWidth =
        window.innerWidth *
        (
            isMobile
                ? 0.96
                : 0.90
        );


    const maxHeight =
        window.innerHeight *
        (
            isMobile
                ? 0.94
                : 0.90
        );


    const scaleX =
        maxWidth /
        naturalWidth;


    const scaleY =
        maxHeight /
        naturalHeight;


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


if (
    machineImage.complete
) {

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
   RANDOM
   ========================================= */

function random(
    min,
    max
) {

    return (
        Math.random() *
        (max - min) +
        min
    );

}


/* =========================================
   LÍMITES DE CÁPSULAS
   ========================================= */

function getCapsuleLimits(
    capsule
) {

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
   ANIMAR CÁPSULAS INTERNAS
   ========================================= */

function animateCapsule(
    capsule,
    index
) {

    const limits =
        getCapsuleLimits(
            capsule
        );


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
        random(
            1900,
            2400
        );


    const delay =
        random(
            0,
            180
        ) +
        index * 12;


    return capsule.animate(
        [

            {
                translate:
                    "0px 0px",

                rotate:
                    "0deg",

                offset:
                    0
            },

            {
                translate:
                    `${x1}px ${y1}px`,

                rotate:
                    `${r1}deg`,

                offset:
                    0.28
            },

            {
                translate:
                    `${x2}px ${y2}px`,

                rotate:
                    `${r2}deg`,

                offset:
                    0.55
            },

            {
                translate:
                    `${x3}px ${y3}px`,

                rotate:
                    `${r3}deg`,

                offset:
                    0.78
            },

            {
                translate:
                    "0px 0px",

                rotate:
                    "0deg",

                offset:
                    1
            }

        ],

        {

            duration:
                duration,

            iterations:
                1,

            delay:
                delay,

            easing:
                "cubic-bezier(0.45, 0, 0.25, 1)",

            fill:
                "none"

        }
    );

}


/* =========================================
   ACTIVAR GACHA
   ========================================= */

function runGacha() {

    if (
        machineIsRunning
    ) {

        return;

    }


    machineIsRunning =
        true;


    capsules.forEach(
        (
            capsule,
            index
        ) => {

            animateCapsule(
                capsule,
                index
            );

        }
    );


    setTimeout(
        () => {

            dispenseCapsule();

        },

        1850
    );


    setTimeout(
        () => {

            machineIsRunning =
                false;

        },

        5000
    );

}


/* =========================================
   CREAR CÁPSULA DE SALIDA
   ========================================= */

function createDispensedCapsule() {

    if (
        capsuleShakeAnimation
    ) {

        capsuleShakeAnimation.cancel();

        capsuleShakeAnimation =
            null;

    }


    if (
        rarityImage
    ) {

        rarityImage.remove();

        rarityImage =
            null;

    }


    if (
        dispensedCapsule
    ) {

        dispensedCapsule.remove();

        dispensedCapsule =
            null;

    }


    capsuleCanOpen =
        false;


    capsuleIsOpening =
        false;


    capsuleCanClose =
        false;


    capsuleIsClosing =
        false;


    letterCanRevealFinal =
        false;


    currentGachaResult =
        getNextGachaResult();


    const capsule =
        document.createElement(
            "img"
        );


    capsule.src =
        currentGachaResult.closed;


    capsule.alt =
        "Cápsula obtenida";


    capsule.draggable =
        false;


    capsule.style.position =
        "absolute";


    capsule.style.zIndex =
        "80";


    capsule.style.left =
        `${DISPENSER_X}%`;


    capsule.style.top =
        `${DISPENSER_Y}%`;


    capsule.style.width =
        `${DISPENSED_CAPSULE_WIDTH}%`;


    capsule.style.height =
        "auto";


    capsule.style.opacity =
        "0";


    capsule.style.filter =
        "none";


    capsule.style.pointerEvents =
        "none";


    capsule.style.userSelect =
        "none";


    capsule.style.webkitUserDrag =
        "none";


    capsule.style.transformOrigin =
        "center center";


    capsule.style.transform =
        `
        translate(-50%, -50%)
        scale(0.18)
        `;


    machine.appendChild(
        capsule
    );


    dispensedCapsule =
        capsule;


    return capsule;

}


/* =========================================
   HACER SALIR CÁPSULA
   ========================================= */

function dispenseCapsule() {

    const capsule =
        createDispensedCapsule();


    const startAnimation =
        () => {


            const exitAnimation =
                capsule.animate(
                    [

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(0px, -4px)
                                scale(0.18)
                                rotate(-8deg)
                                `,

                            opacity:
                                0,

                            offset:
                                0
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(-1px, 0px)
                                scale(0.35)
                                rotate(-4deg)
                                `,

                            opacity:
                                0.30,

                            offset:
                                0.18
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(-4px, 8px)
                                scale(0.58)
                                rotate(4deg)
                                `,

                            opacity:
                                0.68,

                            offset:
                                0.36
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(
                                    ${CAPSULE_MOVE_X * 0.25}px,
                                    ${CAPSULE_MOVE_Y * 0.25}px
                                )
                                scale(0.82)
                                rotate(-5deg)
                                `,

                            opacity:
                                0.92,

                            offset:
                                0.55
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(
                                    ${CAPSULE_MOVE_X * 0.58}px,
                                    ${CAPSULE_MOVE_Y * 0.58}px
                                )
                                scale(1)
                                rotate(6deg)
                                `,

                            opacity:
                                1,

                            offset:
                                0.72
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(
                                    ${CAPSULE_MOVE_X}px,
                                    ${CAPSULE_MOVE_Y}px
                                )
                                scale(1)
                                rotate(-3deg)
                                `,

                            opacity:
                                1,

                            offset:
                                0.90
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                translate(
                                    ${CAPSULE_MOVE_X}px,
                                    ${CAPSULE_MOVE_Y - 4}px
                                )
                                scale(1)
                                rotate(0deg)
                                `,

                            opacity:
                                1,

                            offset:
                                1
                        }

                    ],

                    {

                        duration:
                            1550,

                        easing:
                            "cubic-bezier(0.22, 1, 0.36, 1)",

                        fill:
                            "forwards"

                    }
                );


            exitAnimation.onfinish =
                () => {


                    setTimeout(
                        () => {

                            moveCapsuleToCenter(
                                capsule
                            );

                        },

                        300
                    );

                };

        };


    if (
        capsule.complete &&
        capsule.naturalWidth > 0
    ) {

        startAnimation();

    } else {

        capsule.addEventListener(
            "load",
            startAnimation,
            {
                once:
                    true
            }
        );

    }

}


/* =========================================
   MOVER AL CENTRO
   ========================================= */

function moveCapsuleToCenter(
    capsule
) {

    const rect =
        capsule.getBoundingClientRect();


    capsule.getAnimations().forEach(
        animation =>
            animation.cancel()
    );


    const startX =
        rect.left +
        rect.width / 2;


    const startY =
        rect.top +
        rect.height / 2;


    capsule.style.position =
        "fixed";


    capsule.style.left =
        `${startX}px`;


    capsule.style.top =
        `${startY}px`;


    capsule.style.width =
        `${rect.width}px`;


    capsule.style.height =
        "auto";


    capsule.style.opacity =
        "1";


    capsule.style.zIndex =
        "9999";


    capsule.style.pointerEvents =
        "none";


    capsule.style.transformOrigin =
        "center center";


    capsule.style.transform =
        `
        translate(-50%, -50%)
        scale(1)
        `;


    const finalSize =
        Math.min(
            window.innerWidth,
            window.innerHeight
        ) *
        (
            CENTER_CAPSULE_SIZE /
            100
        );


    const finalScale =
        finalSize /
        rect.width;


    const finalX =
        window.innerWidth /
        2;


    const finalY =
        window.innerHeight /
        2;


    const centerAnimation =
        capsule.animate(
            [

                {
                    left:
                        `${startX}px`,

                    top:
                        `${startY}px`,

                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1)
                        rotate(0deg)
                        `
                },

                {
                    left:
                        `${finalX}px`,

                    top:
                        `${finalY}px`,

                    transform:
                        `
                        translate(-50%, -50%)
                        scale(${finalScale})
                        rotate(-2deg)
                        `
                }

            ],

            {

                duration:
                    900,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)",

                fill:
                    "forwards"

            }
        );


    centerAnimation.onfinish =
        () => {


            capsule.getAnimations().forEach(
                animation =>
                    animation.cancel()
            );


            capsule.style.left =
                `${finalX}px`;


            capsule.style.top =
                `${finalY}px`;


            capsule.style.width =
                `${finalSize}px`;


            capsule.style.height =
                "auto";


            capsule.style.transform =
                `
                translate(-50%, -50%)
                rotate(0deg)
                `;


            capsuleCanOpen =
                true;


            capsule.style.pointerEvents =
                "auto";


            capsule.style.cursor =
                "pointer";


            startCapsuleShake(
                capsule
            );

        };

}


/* =========================================
   AGITAR CÁPSULA
   ========================================= */

function startCapsuleShake(
    capsule
) {

    if (
        capsuleShakeAnimation
    ) {

        capsuleShakeAnimation.cancel();

        capsuleShakeAnimation =
            null;

    }


    capsuleShakeAnimation =
        capsule.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        translateX(0px)
                        rotate(0deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        translateX(-6px)
                        rotate(-2.5deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        translateX(0px)
                        rotate(0deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        translateX(6px)
                        rotate(2.5deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        translateX(0px)
                        rotate(0deg)
                        `
                }

            ],

            {

                duration:
                    1300,

                iterations:
                    Infinity,

                easing:
                    "ease-in-out"

            }
        );

}


/* =========================================
   ABRIR CÁPSULA
   ========================================= */

function openCapsule() {

    if (
        !capsuleCanOpen ||
        capsuleIsOpening ||
        !dispensedCapsule ||
        !currentGachaResult
    ) {

        return;

    }


    capsuleCanOpen =
        false;


    capsuleIsOpening =
        true;


    if (
        capsuleShakeAnimation
    ) {

        capsuleShakeAnimation.cancel();

        capsuleShakeAnimation =
            null;

    }


    const capsule =
        dispensedCapsule;


    capsule.style.pointerEvents =
        "none";


    capsule.style.cursor =
        "default";


    const anticipation =
        capsule.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1)
                        rotate(0deg)
                        `,

                    opacity:
                        1
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(0.94)
                        rotate(-2deg)
                        `,

                    opacity:
                        1,

                    offset:
                        0.40
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1.10)
                        rotate(2deg)
                        `,

                    opacity:
                        0,

                    offset:
                        1
                }

            ],

            {

                duration:
                    300,

                easing:
                    "ease-out",

                fill:
                    "forwards"

            }
        );


    anticipation.onfinish =
        () => {


            capsule.style.visibility =
                "hidden";


            showRarity();

        };

}


/* =========================================
   MOSTRAR RAREZA
   ========================================= */

function showRarity() {

    const badge =
        document.createElement(
            "img"
        );


    badge.src =
        currentGachaResult.rarity;


    badge.alt =
        "Rareza";


    badge.draggable =
        false;


    badge.style.position =
        "fixed";


    badge.style.left =
        "50%";


    badge.style.top =
        "50%";


    badge.style.width =
        "min(48vw, 380px)";


    badge.style.maxHeight =
        "42vh";


    badge.style.height =
        "auto";


    badge.style.objectFit =
        "contain";


    badge.style.zIndex =
        "10001";


    badge.style.opacity =
        "0";


    badge.style.pointerEvents =
        "none";


    badge.style.userSelect =
        "none";


    badge.style.webkitUserDrag =
        "none";


    badge.style.transformOrigin =
        "center center";


    badge.style.transform =
        `
        translate(-50%, -50%)
        scale(0.25)
        `;


    badge.style.filter =
        `
        drop-shadow(
            0 8px 14px
            rgba(0, 0, 0, 0.15)
        )
        `;


    document.body.appendChild(
        badge
    );


    rarityImage =
        badge;


    const startAnimation =
        () => {


            const pop =
                badge.animate(
                    [

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(0.25)
                                rotate(-5deg)
                                `,

                            opacity:
                                0
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(1.14)
                                rotate(3deg)
                                `,

                            opacity:
                                1,

                            offset:
                                0.65
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(0.96)
                                rotate(-1deg)
                                `,

                            opacity:
                                1,

                            offset:
                                0.82
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(1)
                                rotate(0deg)
                                `,

                            opacity:
                                1
                        }

                    ],

                    {

                        duration:
                            520,

                        easing:
                            "cubic-bezier(0.22, 1, 0.36, 1)",

                        fill:
                            "forwards"

                    }
                );


            pop.onfinish =
                () => {


                    setTimeout(
                        () => {

                            hideRarityAndRevealResult(
                                badge
                            );

                        },

                        RARITY_DISPLAY_TIME
                    );

                };

        };


    if (
        badge.complete &&
        badge.naturalWidth > 0
    ) {

        startAnimation();

    } else {

        badge.addEventListener(
            "load",
            startAnimation,
            {
                once:
                    true
            }
        );

    }

}


/* =========================================
   OCULTAR RAREZA
   ========================================= */

function hideRarityAndRevealResult(
    badge
) {

    const animation =
        badge.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1)
                        `,

                    opacity:
                        1
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1.10)
                        `,

                    opacity:
                        1,

                    offset:
                        0.35
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(0.60)
                        `,

                    opacity:
                        0
                }

            ],

            {

                duration:
                    340,

                easing:
                    "ease-in",

                fill:
                    "forwards"

            }
        );


    animation.onfinish =
        () => {


            badge.remove();


            rarityImage =
                null;


            revealOpenedCapsule();

        };

}


/* =========================================
   MOSTRAR IMAGEN 2
   ========================================= */

function revealOpenedCapsule() {

    if (
        !dispensedCapsule ||
        !currentGachaResult
    ) {

        return;

    }


    const capsule =
        dispensedCapsule;


    capsule.src =
        currentGachaResult.opened;


    const showResult =
        () => {


            capsule.getAnimations().forEach(
                animation =>
                    animation.cancel()
            );


            capsule.style.visibility =
                "visible";


            capsule.style.height =
                "auto";


            capsule.style.opacity =
                "1";


            capsule.style.pointerEvents =
                "none";


            capsule.style.filter =
                `
                drop-shadow(
                    0 10px 18px
                    rgba(0, 0, 0, 0.22)
                )
                `;


            capsule.style.transform =
                `
                translate(-50%, -50%)
                scale(1)
                rotate(0deg)
                `;


            const resultAnimation =
                capsule.animate(
                    [

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(0.72)
                                rotate(-3deg)
                                `,

                            opacity:
                                0,

                            filter:
                                `
                                drop-shadow(
                                    0 2px 4px
                                    rgba(0,0,0,0)
                                )
                                `
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(1.10)
                                rotate(2deg)
                                `,

                            opacity:
                                1,

                            filter:
                                `
                                drop-shadow(
                                    0 12px 22px
                                    rgba(0,0,0,0.24)
                                )
                                `,

                            offset:
                                0.62
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(0.97)
                                rotate(-1deg)
                                `,

                            opacity:
                                1,

                            offset:
                                0.82
                        },

                        {
                            transform:
                                `
                                translate(-50%, -50%)
                                scale(1)
                                rotate(0deg)
                                `,

                            opacity:
                                1,

                            filter:
                                `
                                drop-shadow(
                                    0 10px 18px
                                    rgba(0,0,0,0.22)
                                )
                                `
                        }

                    ],

                    {

                        duration:
                            600,

                        easing:
                            "cubic-bezier(0.22, 1, 0.36, 1)",

                        fill:
                            "forwards"

                    }
                );


            resultAnimation.onfinish =
                () => {


                    capsuleIsOpening =
                        false;


                    /*
                       LETTER todavía NO se
                       puede cerrar.

                       Primero hay que hacer
                       click en letter2.
                    */

                    if (
                        currentGachaResult.name ===
                        "letter"
                    ) {

                        letterCanRevealFinal =
                            true;


                        capsuleCanClose =
                            false;

                    } else {

                        capsuleCanClose =
                            true;

                    }


                    capsule.style.pointerEvents =
                        "auto";


                    capsule.style.cursor =
                        "pointer";

                };

        };


    if (
        capsule.complete &&
        capsule.naturalWidth > 0
    ) {

        showResult();

    } else {

        capsule.addEventListener(
            "load",
            showResult,
            {
                once:
                    true
            }
        );

    }

}


/* =========================================
   LETTER2 -> LETTER3
   ========================================= */

function revealLetterFinal() {

    if (
        !letterCanRevealFinal ||
        !dispensedCapsule ||
        !currentGachaResult ||
        currentGachaResult.name !==
            "letter"
    ) {

        return;

    }


    letterCanRevealFinal =
        false;


    capsuleCanClose =
        false;


    const capsule =
        dispensedCapsule;


    capsule.style.pointerEvents =
        "none";


    capsule.style.cursor =
        "default";


    /*
       Pequeño pop de salida de letter2.
    */

    const transitionOut =
        capsule.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1)
                        rotate(0deg)
                        `,

                    opacity:
                        1
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1.08)
                        rotate(2deg)
                        `,

                    opacity:
                        1,

                    offset:
                        0.45
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(0.78)
                        rotate(-3deg)
                        `,

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


    transitionOut.onfinish =
        () => {


            capsule.src =
                currentGachaResult.final;


            const showFinal =
                () => {


                    capsule.getAnimations().forEach(
                        animation =>
                            animation.cancel()
                    );


                    capsule.style.opacity =
                        "1";


                    capsule.style.visibility =
                        "visible";


                    capsule.style.filter =
                        `
                        drop-shadow(
                            0 10px 18px
                            rgba(0, 0, 0, 0.22)
                        )
                        `;


                    const finalAnimation =
                        capsule.animate(
                            [

                                {
                                    transform:
                                        `
                                        translate(-50%, -50%)
                                        scale(0.72)
                                        rotate(-3deg)
                                        `,

                                    opacity:
                                        0
                                },

                                {
                                    transform:
                                        `
                                        translate(-50%, -50%)
                                        scale(1.12)
                                        rotate(2deg)
                                        `,

                                    opacity:
                                        1,

                                    offset:
                                        0.62
                                },

                                {
                                    transform:
                                        `
                                        translate(-50%, -50%)
                                        scale(0.97)
                                        rotate(-1deg)
                                        `,

                                    opacity:
                                        1,

                                    offset:
                                        0.82
                                },

                                {
                                    transform:
                                        `
                                        translate(-50%, -50%)
                                        scale(1)
                                        rotate(0deg)
                                        `,

                                    opacity:
                                        1
                                }

                            ],

                            {

                                duration:
                                    620,

                                easing:
                                    "cubic-bezier(0.22, 1, 0.36, 1)",

                                fill:
                                    "forwards"

                            }
                        );


                    finalAnimation.onfinish =
                        () => {


                            /*
                               Ahora sí letter3
                               se puede cerrar.
                            */

                            capsuleCanClose =
                                true;


                            capsule.style.pointerEvents =
                                "auto";


                            capsule.style.cursor =
                                "pointer";

                        };

                };


            if (
                capsule.complete &&
                capsule.naturalWidth > 0
            ) {

                showFinal();

            } else {

                capsule.addEventListener(
                    "load",
                    showFinal,
                    {
                        once:
                            true
                    }
                );

            }

        };

}


/* =========================================
   CERRAR RESULTADO
   ========================================= */

function closeResult() {

    if (
        !capsuleCanClose ||
        capsuleIsClosing ||
        !dispensedCapsule
    ) {

        return;

    }


    capsuleCanClose =
        false;


    capsuleIsClosing =
        true;


    const capsule =
        dispensedCapsule;


    capsule.style.pointerEvents =
        "none";


    capsule.style.cursor =
        "default";


    const closeAnimation =
        capsule.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1)
                        rotate(0deg)
                        `,

                    opacity:
                        1,

                    filter:
                        `
                        drop-shadow(
                            0 10px 18px
                            rgba(0,0,0,0.22)
                        )
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(1.05)
                        rotate(2deg)
                        `,

                    opacity:
                        1,

                    offset:
                        0.30
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        scale(0.70)
                        rotate(-4deg)
                        `,

                    opacity:
                        0,

                    filter:
                        `
                        drop-shadow(
                            0 2px 4px
                            rgba(0,0,0,0)
                        )
                        `
                }

            ],

            {

                duration:
                    420,

                easing:
                    "cubic-bezier(0.4, 0, 0.2, 1)",

                fill:
                    "forwards"

            }
        );


    closeAnimation.onfinish =
        () => {


            capsule.remove();


            dispensedCapsule =
                null;


            currentGachaResult =
                null;


            capsuleIsOpening =
                false;


            capsuleIsClosing =
                false;


            capsuleCanOpen =
                false;


            capsuleCanClose =
                false;


            letterCanRevealFinal =
                false;


            unlockNextToken();

        };

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


    tokenMoveX =
        0;


    tokenMoveY =
        0;


    tokenScale =
        1;


    activateCurrentToken();

}


/* =========================================
   POSICIÓN DE RANURA
   ========================================= */

function getTokenSlotPosition() {

    const machineRect =
        machine.getBoundingClientRect();


    return {

        x:
            machineRect.left +
            machineRect.width *
            0.32,

        y:
            machineRect.top +
            machineRect.height *
            0.695,

        radiusX:
            machineRect.width *
            0.055,

        radiusY:
            machineRect.height *
            0.045

    };

}


/* =========================================
   CENTRO DEL TOKEN
   ========================================= */

function getTokenCenter() {

    if (
        !currentToken
    ) {

        return {
            x: 0,
            y: 0
        };

    }


    const rect =
        currentToken.getBoundingClientRect();


    return {

        x:
            rect.left +
            rect.width / 2,

        y:
            rect.top +
            rect.height / 2

    };

}


/* =========================================
   DISTANCIA A RANURA
   ========================================= */

function getTokenDistanceFromSlot() {

    const tokenCenter =
        getTokenCenter();


    const slot =
        getTokenSlotPosition();


    const dx =
        tokenCenter.x -
        slot.x;


    const dy =
        tokenCenter.y -
        slot.y;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================
   ESCALA DEL TOKEN
   ========================================= */

function calculateTokenScale() {

    const machineRect =
        machine.getBoundingClientRect();


    const distance =
        getTokenDistanceFromSlot();


    const influenceDistance =
        machineRect.width *
        0.23;


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
   TRANSFORM DEL TOKEN
   ========================================= */

function updateTokenTransform() {

    if (
        !currentToken
    ) {

        return;

    }


    currentToken.style.transform =
        `
        translate(
            ${tokenMoveX}px,
            ${tokenMoveY}px
        )
        scale(${tokenScale})
        `;

}


/* =========================================
   DETECTAR RANURA
   ========================================= */

function tokenIsNearSlot() {

    if (
        !currentToken
    ) {

        return false;

    }


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
        distanceX <=
        slot.radiusX &&
        distanceY <=
        slot.radiusY
    );

}


/* =========================================
   AGARRAR TOKEN
   ========================================= */

function startTokenDrag(
    event
) {

    if (
        event.currentTarget !==
        currentToken
    ) {

        return;

    }


    if (
        tokenInserted ||
        dispensedCapsule ||
        capsuleIsOpening ||
        capsuleIsClosing
    ) {

        return;

    }


    tokenIsDragging =
        true;


    startPointerX =
        event.clientX -
        tokenMoveX;


    startPointerY =
        event.clientY -
        tokenMoveY;


    currentToken.classList.add(
        "dragging"
    );


    currentToken.setPointerCapture(
        event.pointerId
    );

}


/* =========================================
   MOVER TOKEN
   ========================================= */

function moveToken(
    event
) {

    if (
        !tokenIsDragging ||
        event.currentTarget !==
        currentToken
    ) {

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


    if (
        tokenIsNearSlot()
    ) {

        currentToken.classList.add(
            "near-slot"
        );

    } else {

        currentToken.classList.remove(
            "near-slot"
        );

    }

}


/* =========================================
   SOLTAR TOKEN
   ========================================= */

function endTokenDrag(
    event
) {

    if (
        !tokenIsDragging ||
        event.currentTarget !==
        currentToken
    ) {

        return;

    }


    tokenIsDragging =
        false;


    currentToken.classList.remove(
        "dragging"
    );


    if (
        currentToken.hasPointerCapture(
            event.pointerId
        )
    ) {

        currentToken.releasePointerCapture(
            event.pointerId
        );

    }


    if (
        tokenIsNearSlot()
    ) {

        insertToken();

        return;

    }


    returnTokenHome();

}


/* =========================================
   REGRESAR TOKEN
   ========================================= */

function returnTokenHome() {

    if (
        !currentToken
    ) {

        return;

    }


    currentToken.classList.remove(
        "near-slot"
    );


    const tokenBeingMoved =
        currentToken;


    const currentX =
        tokenMoveX;


    const currentY =
        tokenMoveY;


    const currentScale =
        tokenScale;


    const animation =
        tokenBeingMoved.animate(
            [

                {
                    transform:
                        `
                        translate(
                            ${currentX}px,
                            ${currentY}px
                        )
                        scale(${currentScale})
                        `
                },

                {
                    transform:
                        `
                        translate(0px, 0px)
                        scale(1)
                        `
                }

            ],

            {

                duration:
                    450,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)"

            }
        );


    animation.onfinish =
        () => {


            tokenMoveX =
                0;


            tokenMoveY =
                0;


            tokenScale =
                1;


            tokenBeingMoved.style.transform =
                `
                translate(0px, 0px)
                scale(1)
                `;

        };

}


/* =========================================
   INSERTAR TOKEN
   ========================================= */

function insertToken() {

    if (
        tokenInserted ||
        !currentToken
    ) {

        return;

    }


    tokenInserted =
        true;


    const tokenBeingUsed =
        currentToken;


    tokenBeingUsed.classList.remove(
        "near-slot"
    );


    tokenBeingUsed.classList.remove(
        "active-token"
    );


    tokenBeingUsed.classList.add(
        "used-token"
    );


    const tokenRect =
        tokenBeingUsed.getBoundingClientRect();


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
        tokenBeingUsed.animate(
            [

                {
                    transform:
                        `
                        translate(
                            ${tokenMoveX}px,
                            ${tokenMoveY}px
                        )
                        scale(${startingScale})
                        `,

                    opacity:
                        1
                },

                {
                    transform:
                        `
                        translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.35)
                        `,

                    opacity:
                        1,

                    offset:
                        0.55
                },

                {
                    transform:
                        `
                        translate(
                            ${finalX}px,
                            ${finalY}px
                        )
                        scale(0.08)
                        `,

                    opacity:
                        0
                }

            ],

            {

                duration:
                    600,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)",

                fill:
                    "forwards"

            }
        );


    animation.onfinish =
        () => {


            tokenBeingUsed.style.visibility =
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
   ÁNGULO DE PERILLA
   ========================================= */

function getPointerAngle(
    event
) {

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
            event.clientY -
            centerY,

            event.clientX -
            centerX
        );


    return (
        radians *
        180 /
        Math.PI
    );

}


/* =========================================
   EMPEZAR GIRO
   ========================================= */

function startKnobTurn(
    event
) {

    if (
        !tokenInserted ||
        machineIsRunning ||
        dispensedCapsule
    ) {

        return;

    }


    knobIsTurning =
        true;


    knobRotation =
        0;


    knobLastPointerAngle =
        getPointerAngle(
            event
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

function moveKnob(
    event
) {

    if (
        !knobIsTurning
    ) {

        return;

    }


    const currentAngle =
        getPointerAngle(
            event
        );


    let difference =
        currentAngle -
        knobLastPointerAngle;


    if (
        difference > 180
    ) {

        difference -=
            360;

    }


    if (
        difference < -180
    ) {

        difference +=
            360;

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
        `
        translate(-50%, -50%)
        rotate(${-knobRotation}deg)
        `;


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
   SOLTAR PERILLA ANTES
   ========================================= */

function endKnobTurn(
    event
) {

    if (
        !knobIsTurning
    ) {

        return;

    }


    knobIsTurning =
        false;


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
   RESET PERILLA
   ========================================= */

function resetKnob() {

    const startingRotation =
        knobRotation;


    const animation =
        knob.animate(
            [

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        rotate(${-startingRotation}deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        rotate(0deg)
                        `
                }

            ],

            {

                duration:
                    450,

                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)"

            }
        );


    animation.onfinish =
        () => {


            knobRotation =
                0;


            knob.style.transform =
                `
                translate(-50%, -50%)
                rotate(0deg)
                `;

        };

}


/* =========================================
   GIRO COMPLETADO
   ========================================= */

function completeKnobTurn(
    pointerId
) {

    knobIsTurning =
        false;


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


    tokenInserted =
        false;


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
                        `
                        translate(-50%, -50%)
                        rotate(${-knobRotation}deg)
                        `
                },

                {
                    transform:
                        `
                        translate(-50%, -50%)
                        rotate(-360deg)
                        `
                }

            ],

            {

                duration:
                    220,

                easing:
                    "ease-out"

            }
        );


    animation.onfinish =
        () => {


            knobRotation =
                0;


            knob.style.transform =
                `
                translate(-50%, -50%)
                rotate(0deg)
                `;

        };


    runGacha();

}


/* =========================================
   EVENTOS TOKENS
   ========================================= */

tokens.forEach(
    token => {


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

    }
);


/* =========================================
   EVENTOS PERILLA
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


/* =========================================
   CLICK EN RESULTADO
   ========================================= */

document.addEventListener(
    "click",
    event => {


        if (
            event.target !==
            dispensedCapsule
        ) {

            return;

        }


        /*
           1. Cápsula cerrada.
        */

        if (
            capsuleCanOpen
        ) {

            openCapsule();

            return;

        }


        /*
           2. LETTER2 -> LETTER3.
        */

        if (
            letterCanRevealFinal
        ) {

            revealLetterFinal();

            return;

        }


        /*
           3. Cerrar resultado.
        */

        if (
            capsuleCanClose
        ) {

            closeResult();

        }

    }
);
