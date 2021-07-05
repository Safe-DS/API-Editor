import React, {useState} from "react";

export default class EnumPair {
    key: string;
    value: string;
    //validKey: boolean;  //als methode is valid
    //validValue: boolean;
    const [validKey, setValidKey] = useState<boolean>(false);
    const [validValue, setValidValue] = useState(true);


    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }
}

