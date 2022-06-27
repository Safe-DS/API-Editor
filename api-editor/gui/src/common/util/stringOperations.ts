export const truncate = function (text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 1) + '\u2026' : text;
};

export const pluralize = function (count: number, noun: string): string {
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
};

export const jsonCode = function (json: string): string {
    return `\`\`\`json5\n${json}\n\`\`\``;
};
