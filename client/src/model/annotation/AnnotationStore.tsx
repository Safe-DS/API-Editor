import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";
import PythonEnum from "../python/PythonEnum";

/* TODO: Es fehlen die Enums. */

interface annotationsJson {
    renamings: Map<string, string>,
    enums: Map<string, PythonEnum>
}

export default class AnnotationStore {
    private readonly renamings: RenameAnnotationStore;
    private readonly enums: EnumAnnotationStore;

    constructor(renamings: RenameAnnotationStore = Map(), enums: EnumAnnotationStore = Map()) {
        this.renamings = renamings;
        this.enums = enums;
    }

    getRenamingFor(declaration: PythonDeclaration): Nullable<string> {
        return this.renamings.get(declaration.pathAsString()) ?? null;
    }

    getEnumFor(enumDefinition: PythonDeclaration): PythonEnum | null {
        return this.enums.get(enumDefinition.pathAsString()) ?? null;
    }

    setRenamingFor(declaration: PythonDeclaration, parameterName: Nullable<string>): AnnotationStore {
        if (parameterName === null || declaration.name === parameterName) {
            return this.removeRenamingFor(declaration);
        }

        return new AnnotationStore(this.renamings.set(declaration.pathAsString(), parameterName), this.enums);
    }

    setEnumFor(declaration: PythonDeclaration, parameterEnum: Nullable<PythonEnum>): AnnotationStore {
        if (parameterEnum === null) {
            return this.removeEnumFor(declaration);
        }

        return new AnnotationStore(this.renamings, this.enums.set(declaration.pathAsString(), parameterEnum));
    }

    private setRenaming(path: string, newName: string) {
        return new AnnotationStore(this.renamings.set(path, newName));
    }

    private setEnum(path: string, pythonEnum: PythonEnum) {
        return new AnnotationStore(this.renamings, this.enums.set(path, pythonEnum));
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(declaration.pathAsString()), this.enums);
    }

    removeEnumFor(enumDefinition: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(enumDefinition.pathAsString()), this.enums);
    }

    toJson(): string {
        return JSON.stringify({"renamings": this.renamings, "enums": this.enums});
    }

    downloadAnnotations(content: string): void {
        const a = document.createElement("a");
        const file = new Blob([content], {type: "text/plain"});
        a.href = URL.createObjectURL(file);
        a.download = "annotations.json";
        a.click();
    }

    fromJson(annotations: annotationsJson): void {
        annotations.renamings.forEach(((value, key) => {
            this.setRenaming(key, value);
        }));
        annotations.enums.forEach(((value, key) => {
            this.setEnum(key, value);
        }));
    }
}

export type RenameAnnotationStore = Map<string, string>
export type EnumAnnotationStore = Map<string, PythonEnum>
