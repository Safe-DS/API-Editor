import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";
import PythonEnum from "../python/PythonEnum";

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

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(declaration.pathAsString()), this.enums);
    }

    removeEnumFor(enumDefinition: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(enumDefinition.pathAsString()), this.enums);
    }
}

export type RenameAnnotationStore = Map<string, string>
export type EnumAnnotationStore = Map<string, PythonEnum>
