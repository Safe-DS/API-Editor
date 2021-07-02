export default class EnumPair {
    key: string;
    value: string;
    validKey: boolean;  //als methode is valid
    validValue: boolean;


    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
        this.validKey = true;
        this.validValue = true;
    }
}

