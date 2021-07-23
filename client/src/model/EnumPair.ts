import { enumKeyValidation, enumValueValidation } from '../util/validation'

export default class EnumPair {
    key: string
    value: string

    constructor(key: string, value: string) {
        this.key = key
        this.value = value
    }

    isValidValue(): boolean {
        return enumValueValidation(this.value)
    }

    isValidKey(): boolean {
        return enumKeyValidation(this.key)
    }
}
