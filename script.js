const capsules = document.querySelectorAll(".capsule");

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function shakeCapsules() {
    capsules.forEach((capsule, index) => {

        const x1 = randomBetween(-18, 18);
        const y1 = randomBetween(-24, 10);
        const r1 = randomBetween(-35, 35);

        const x2 = randomBetween(-20, 20);
        const y2 = randomBetween(-20, 16);
        const r2 = randomBetween(-40, 40);

        const x3 = randomBetween(-16, 16);
        const y3 = randomBetween(-25, 10);
        const r3 = randomBetween(-30, 30);

        capsule.animate(
            [
                {
                    transform: getComputedStyle(capsule).transform
                },
                {
                    transform: `translate(${x1}px, ${y1}px) rotate(${r1}deg)`
                },
                {
                    transform: `translate(${x2}px, ${y2}px) rotate(${r2}deg)`
                },
                {
                    transform: `translate(${x3}px, ${y3}px) rotate(${r3}deg)`
                },
                {
                    transform: getComputedStyle(capsule).transform
                }
            ],
            {
                duration: randomBetween(650, 900),
                iterations: 3,
                easing: "ease-in-out",
                delay: index * 20
            }
        );

    });
}

/*
   Por ahora la animación se activa
   haciendo clic en cualquier parte
   de la máquina.
*/

document.querySelector(".machine-wrap").addEventListener("click", () => {
    shakeCapsules();
});
