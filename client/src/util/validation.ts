export function isValidPythonIdentifier(value: string) : boolean{
    const validPythonIdentifier = /^[A-Za-z_][A-Za-z_0-9]*$/;
    return validPythonIdentifier.test(value);
}
