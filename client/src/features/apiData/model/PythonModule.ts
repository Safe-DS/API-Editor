import { isEmptyList } from '../../../common/util/listOperations'
import { Optional } from '../../../common/util/types'
import PythonClass from './PythonClass'
import PythonDeclaration from './PythonDeclaration'
import { PythonFilter } from './PythonFilter'
import PythonFromImport from './PythonFromImport'
import PythonFunction from './PythonFunction'
import PythonImport from './PythonImport'
import PythonPackage from './PythonPackage'

export default class PythonModule extends PythonDeclaration {
    readonly name: string
    readonly imports: PythonImport[]
    readonly fromImports: PythonFromImport[]
    readonly classes: PythonClass[]
    readonly functions: PythonFunction[]
    containingPackage: Optional<PythonPackage>

    constructor(
        name: string,
        imports: PythonImport[] = [],
        fromImports: PythonFromImport[] = [],
        classes: PythonClass[] = [],
        functions: PythonFunction[] = [],
    ) {
        super()

        this.name = name
        this.imports = imports
        this.fromImports = fromImports
        this.classes = classes
        this.functions = functions
        this.containingPackage = null

        this.classes.forEach((it) => {
            it.containingModule = this
        })

        this.functions.forEach((it) => {
            it.containingModuleOrClass = this
        })
    }

    parent(): Optional<PythonPackage> {
        return this.containingPackage
    }

    children(): (PythonClass | PythonFunction)[] {
        return [...this.classes, ...this.functions]
    }

    toString(): string {
        return `Module "${this.name}"`
    }

    filter(pythonFilter: PythonFilter | void): PythonModule {
        if (!pythonFilter) {
            return this
        }

        const classes = this.classes
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    it.name.toLowerCase().includes((pythonFilter.pythonClass || '').toLowerCase()) &&
                    !isEmptyList(it.methods),
            )

        const functions = this.functions
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    !pythonFilter.pythonClass && // if the class filter is active we hide all top-level functions
                    it.name.toLowerCase().includes((pythonFilter.pythonFunction || '').toLowerCase()) &&
                    !isEmptyList(it.parameters),
            )

        return new PythonModule(this.name, this.imports, this.fromImports, classes, functions)
    }
}
