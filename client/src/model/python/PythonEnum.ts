import EnumPair from "../EnumPair";

export default class PythonEnum {
    name: string
    enumName: string;
    enumPairs: EnumPair[];


    constructor(name: string, enumName: string, enumPairs: EnumPair[]) {
        this.name = name;
        this.enumName = enumName;
        this.enumPairs = enumPairs;
    }
}
