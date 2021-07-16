import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";

/* TODO: Es fehlen die Enums. */

interface annotationsJson {
    renamings: Map<string, string>,
    enums: Map<string, Map<string, string>>
}

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

    private setRenaming(path: string, newName: string) {
        return new AnnotationStore(this.renamings.set(path, newName));
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(declaration.pathAsString()));
    }

    toJson(): string {
        return JSON.stringify({"renamings": this.renamings});
    }

    fromJson(annotations: annotationsJson): void {
        annotations.renamings.forEach(((value, key) => {
            this.setRenaming(value, key);
        }));
    }
}

export type RenameAnnotationStore = Map<string, string>
