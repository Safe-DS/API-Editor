export function isValidPythonIdentifier(value: string): boolean {
    return /^[A-Za-z_][A-Za-z_0-9]*$/.test(value)
}

export function isValidJsonFile(value: string): boolean {
    const validJsonIdentifier = /^.*\.(json)$/
    return validJsonIdentifier.test(value)
}

export function isValidEnumInstanceName(value: string): boolean {
    const valueRegex = new RegExp(/^[A-Z]+[A-Z_0-9]*$/)
    return !!value.match(valueRegex)
}
