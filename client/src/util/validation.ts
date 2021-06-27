export function nameValidation (value: string) : boolean{
    const nameRegex = new RegExp(/^[a-zA-Z_]+[A-Za-z0-9\-_]*$/i);
    return !!value.match(nameRegex);
}

export function enumValueValidation (value: string) : boolean{
    const valueRegex = new RegExp(/^[a-zA-Z0-9_]+$/i);
    return !!value.match(valueRegex);
}
