import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";

export default class AnnotationStore {
    private readonly renamings: RenameAnnotationStore

    constructor(renamings: RenameAnnotationStore = Map()) {
        this.renamings = renamings;
    }

    getRenamingFor(declaration: PythonDeclaration): Nullable<string> {
        return this.renamings.get(declaration.pathAsString()) ?? null;
    }

    setRenamingFor(declaration: PythonDeclaration, newName: Nullable<string>): AnnotationStore {
        if (newName === null || declaration.name === newName) {
            return this.removeRenamingFor(declaration);
        }

        return new AnnotationStore(this.renamings.set(declaration.pathAsString(), newName));
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(declaration.pathAsString()));
    }
}

export type RenameAnnotationStore = Map<string, string>
