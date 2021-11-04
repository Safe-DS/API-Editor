import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';

export default class PythonParameter extends PythonDeclaration {
    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly hasDefault: boolean;
    readonly defaultValue: string;
    readonly limitation: null;
    readonly ignored: boolean;
    readonly description: string;
    containingFunction: Optional<PythonFunction>;

    constructor(
        name: string,
        type = 'Any',
        typeInDocs = '',
        hasDefault = false,
        defaultValue = '',
        limitation = null,
        ignored = false,
        description = '',
    ) {
        super();

        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.hasDefault = hasDefault;
        this.defaultValue = defaultValue;
        this.limitation = limitation;
        this.ignored = ignored;
        this.description = description;
        this.containingFunction = null;
    }

    parent(): Optional<PythonFunction> {
        return this.containingFunction;
    }

    children(): PythonDeclaration[] {
        return [];
    }

    isExplicitParameter(): boolean {
        const containingFunction = this.parent();
        if (!containingFunction) {
            return false;
        }

        // This is parameter of global function
        if (containingFunction.parent() instanceof PythonModule) {
            return true;
        }

        // This is parameter of a method but not the first
        return containingFunction.children()[0] !== this;
    }

    toString(): string {
        return `Parameter "${this.name}"`;
    }

    clone(): PythonParameter {
        return new PythonParameter(
            this.name,
            this.type,
            this.typeInDocs,
            this.hasDefault,
            this.defaultValue,
            this.limitation,
            this.ignored,
            this.description,
        );
    }
}
