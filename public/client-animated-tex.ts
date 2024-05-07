interface AnimBoxElements {
    animBox: HTMLElement;
    animElements: HTMLElement[];
    increment: 1 | -1;
    currentTick: number;
}

const animBoxElements: AnimBoxElements[] = Array.from(document.getElementsByClassName('anim-box')).map((animBox) => ({
    animBox: animBox as HTMLElement,
    animElements: Array.from(animBox.querySelectorAll('.anim-element')).map((x) => x as HTMLElement),
    increment: 1,
    currentTick: 0,
}));

// console.debug(animBoxElements);

for (const data of animBoxElements) {
    data.animElements[0].classList.add('visible');
}

setInterval(() => {
    for (const data of animBoxElements) {
        if (data.increment === -1 && data.currentTick === 0) {
            data.increment = 1;
        } else if (data.increment === 1 && data.currentTick === data.animElements.length - 1) {
            data.increment = -1;
        }
        const newTick = data.currentTick + data.increment;
        const bound = data.animBox.children.length;
        if (data.currentTick < bound && newTick < bound) {
            const [oldElement, newElement] = [data.animElements[data.currentTick], data.animElements[newTick]];
            oldElement.classList.remove('visible');
            oldElement.style.maxWidth = '0px';
            newElement.classList.add('visible');
            newElement.style.maxWidth = newElement.scrollWidth + 'px';
        }
        data.currentTick = newTick;
    }
}, 3000);
