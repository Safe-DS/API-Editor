export const booleanPattern = {
    value: /^(true|false)$/u,
    message: 'A valid boolean value is either "true" or "false".',
};

export const numberPattern = {
    value: /^[-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?$/u,
    message:
        'A number must consist of digits (0 to 9). It may be prefixed by "+" or "-" and may contain a single "." as separator for decimal places. It may as well contain a single exponent character "e" or "E", optionally followed by "-" or "+" and at least one digit.',
};

export const pythonIdentifierPattern = {
    value: /^[A-Za-z_][A-Za-z_0-9]*$/u,
    message:
        'Valid Python identifiers must start with a letter or underscore followed by letters, numbers, and underscores.',
};

export const moduleNamePattern = {
    value: /^[A-Za-z_][A-Za-z_0-9.]*$/u,
    message:
        'A valid module name must start with a letter or underscore followed by letters, numbers, dots and underscores.',
};
