export const pythonIdentifierPattern = {
    value: /^[A-Za-z_][A-Za-z_0-9]*$/u,
    message:
        'Valid Python identifiers must start with a letter or underscore followed by letters, numbers, and underscores.',
};

export const decimalPattern = {
    value: /^[+-]?(([0-9]|[1-9][0-9]*)([.][0-9]*)?|[.][0-9]+)$/u,
    message:
        'A valid decimal value may start with "+" or "-" followed by numbers and "." as separator for decimal places.',
};

export const booleanPattern = {
    value: /^(true|false)$/u,
    message: 'A valid boolean value is either "true" or "false".',
};
