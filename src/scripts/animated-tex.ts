export const anim = (...data: string[]): string => {
    return `{\\htmlClass{anim-box}{` + data.map((str) => `\\htmlClass{anim-element}{${str}}`).join('') + '}}';
};
