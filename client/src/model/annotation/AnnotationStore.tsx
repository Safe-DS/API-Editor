import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";
import PythonEnum from "../python/PythonEnum";

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
        console.log("renamings", this.renamings);
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

    private setRenamings(renamings: Map<string, string>): AnnotationStore {
        console.log("renamings setRenamings", renamings);
        console.log("enums setRenamings", this.enums);
        return new AnnotationStore(renamings, this.enums);
    }

    private setEnums(enums: Map<string, PythonEnum>): AnnotationStore {
        return new AnnotationStore(this.renamings, enums);
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        this.renamings.delete(declaration.pathAsString());
        return new AnnotationStore(this.renamings, this.enums);
    }

    removeEnumFor(enumDefinition: PythonDeclaration): AnnotationStore {
        this.renamings.delete(enumDefinition.pathAsString());
        return new AnnotationStore(this.renamings, this.enums);
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

    static fromJson(annotations: annotationsJson): AnnotationStore {
        console.log("fromJson Annotation Renamings", annotations.renamings);
        return new AnnotationStore()
            .setRenamings(annotations.renamings)
            .setEnums(annotations.enums);
    }
}

export type RenameAnnotationStore = Map<string, string>
export type EnumAnnotationStore = Map<string, PythonEnum>
