import {Nullable} from "../../util/types";

export default abstract class PythonDeclaration {
    abstract readonly name: string

    abstract parent(): Nullable<PythonDeclaration>

    path(): string[] {
        let current: Nullable<PythonDeclaration> = this;
        const result: string[] = [];

        while (current != null) {
            result.unshift(current.name);
            current = current.parent();
        }

        return result;
    }
}
