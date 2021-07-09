export function isValidPythonIdentifier(value: string) : boolean{
    const validPythonIdentifier = /^[A-Za-z_][A-Za-z_0-9]*$/;
    return validPythonIdentifier.test(value);
}

export function enumValueValidation (value: string) : boolean{
    const valueRegex = new RegExp(/^[a-zA-Z0-9_]+$/i);
    return !!value.match(valueRegex);
}
