export function nameValidation (value: string) : boolean{
    const nameRegex = new RegExp(/^[a-zA-Z_]+[A-Za-z0-9\-_]*$/i);
    return !!value.match(nameRegex);
}

