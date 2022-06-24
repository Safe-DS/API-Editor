export const truncate = function (text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 1) + '\u2026' : text;
};
