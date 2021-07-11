import {isEmptyList} from "../../util/listOperations";
import {Nullable} from "../../util/types";
import EnumPair from "../EnumPair";

export default abstract class EnumDeclaration {
    abstract readonly enumName: string;
    abstract readonly enumPairs: EnumPair[];

    abstract parent(): Nullable<EnumDeclaration>

    abstract children(): EnumDeclaration[]

    path(): string[] {
        let current: Nullable<EnumDeclaration> = this;
        const result: string[] = [];

        while (current !== null) {
            result.unshift(current.enumName);
            current = current.parent();
        }

        return result;
    }

    pathAsString(): string {
        return this.path().join("/");
    }

    getByRelativePath(relativePath: string[]): Nullable<EnumDeclaration> {
        if (isEmptyList(relativePath)) {
            return this;
        }

        const [head, ...tail] = relativePath;
        return this.children().find(it => it.enumName === head)?.getByRelativePath(tail) ?? null;
    }
}
