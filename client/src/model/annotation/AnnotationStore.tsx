import * as Immutable from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";
import PythonEnum from "../python/PythonEnum";

export interface AnnotationJson {
    // These are deliberately normal ES6 maps
    renamings: Map<string, string>,
    enums: Map<string, PythonEnum>
}

export type PythonPath = string
export type PythonName = string
export type RenameAnnotationStore = Immutable.Map<PythonPath, PythonName>
export type EnumAnnotationStore = Immutable.Map<PythonPath, PythonEnum>

export default class AnnotationStore {
    private readonly renamings: RenameAnnotationStore;
    private readonly enums: EnumAnnotationStore;

    constructor(renamings: RenameAnnotationStore = Immutable.Map(), enums: EnumAnnotationStore = Immutable.Map()) {
        this.renamings = renamings;
        this.enums = enums;
    }

    getRenamingFor(declaration: PythonDeclaration): Nullable<string> {
        return this.renamings.get(declaration.pathAsString()) ?? null;
    }

    getEnumFor(enumDefinition: PythonDeclaration): PythonEnum | null {
        return this.enums.get(enumDefinition.pathAsString()) ?? null;
    }

    setRenamingFor(declaration: PythonDeclaration, parameterName: Nullable<PythonName>): AnnotationStore {
        if (parameterName === null || declaration.name === parameterName) {
            return this.removeRenamingFor(declaration);
        }

        return this.setRenamings(this.renamings.set(declaration.pathAsString(), parameterName));
    }

    setEnumFor(declaration: PythonDeclaration, parameterEnum: Nullable<PythonEnum>): AnnotationStore {
        if (parameterEnum === null) {
            return this.removeEnumFor(declaration);
        }

        return this.setEnums(this.enums.set(declaration.pathAsString(), parameterEnum));
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return this.setRenamings(this.renamings.remove(declaration.pathAsString()));
    }

    removeEnumFor(enumDefinition: PythonDeclaration): AnnotationStore {
        return this.setEnums(this.enums.remove(enumDefinition.pathAsString()));
    }

    private setRenamings(renamings: RenameAnnotationStore): AnnotationStore {
        return new AnnotationStore(renamings, this.enums);
    }
    private setEnums(enums: EnumAnnotationStore): AnnotationStore {
        return new AnnotationStore(this.renamings, enums);
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

    static fromJson(annotations: AnnotationJson): AnnotationStore {
        return new AnnotationStore(
            Immutable.Map(annotations.renamings),
            Immutable.Map(annotations.enums)
        );
    }
}
