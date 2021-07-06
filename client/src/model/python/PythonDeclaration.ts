import {isEmptyList} from "../../util/listOperations";
import {Nullable} from "../../util/types";

export default abstract class PythonDeclaration {
    abstract readonly name: string

    abstract parent(): Nullable<PythonDeclaration>

    abstract children(): PythonDeclaration[]

    path(): string[] {
        let current: Nullable<PythonDeclaration> = this;
        const result: string[] = [];

        while (current !== null) {
            result.unshift(current.name);
            current = current.parent();
        }

        return result;
    }

    getByRelativePath(relativePath: string[]): Nullable<PythonDeclaration> {
        if (isEmptyList(relativePath)) {
            return this;
        }

        const [head, ...tail] = relativePath;
        return this.children().find(it => it.name === head)?.getByRelativePath(tail) ?? null;
    }
}
