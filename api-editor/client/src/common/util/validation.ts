export const isValidPythonIdentifier = function (value: string): boolean {
    return /^[A-Za-z_][A-Za-z_0-9]*$/u.test(value);
};

export const isValidJsonFile = function (value: string): boolean {
    const validJsonIdentifier = /^.*\.(json)$/u;
    return validJsonIdentifier.test(value);
};

export const isValidEnumInstanceName = function (value: string): boolean {
    const valueRegex = /^[A-Z]+[A-Z_0-9]*$/u;
    return Boolean(value.match(valueRegex));
};
