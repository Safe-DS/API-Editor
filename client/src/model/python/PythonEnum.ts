import EnumPair from "../EnumPair";

export default class PythonEnum {
    enumName: string;
    enumPairs: EnumPair[];


    constructor(enumName: string, enumPairs: EnumPair[]) {
        this.enumName = enumName;
        this.enumPairs = enumPairs;
    }
}
