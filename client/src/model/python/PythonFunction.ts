import { Nullable } from '../../util/types'
import PythonClass from './PythonClass'
import PythonDeclaration from './PythonDeclaration'
import PythonModule from './PythonModule'
import PythonParameter from './PythonParameter'
import PythonResult from './PythonResult'

export default class PythonFunction extends PythonDeclaration {
    readonly name: string
    readonly decorators: string[]
    readonly parameters: PythonParameter[]
    readonly results: PythonResult[]
    readonly returnType: string
    readonly summary: string
    readonly description: string
    readonly fullDocstring: string
    containingModuleOrClass: Nullable<PythonModule | PythonClass>

    constructor(
        name: string,
        decorators: string[] = [],
        parameters: PythonParameter[] = [],
        results: PythonResult[] = [],
        returnType = 'Any',
        summary = '',
        description = '',
        fullDocstring = '',
    ) {
        super()

        this.name = name
        this.decorators = decorators
        this.parameters = parameters
        this.results = results
        this.returnType = returnType
        this.summary = summary
        this.description = description
        this.fullDocstring = fullDocstring
        this.containingModuleOrClass = null

        this.parameters.forEach((it) => {
            it.containingFunction = this
        })

        this.results.forEach((it) => {
            it.containingFunction = this
        })
    }

    parent(): Nullable<PythonModule | PythonClass> {
        return this.containingModuleOrClass
    }

    children(): PythonParameter[] {
        return this.parameters
    }

    toString(): string {
        let result = ''

        if (this.decorators.length > 0) {
            result += this.decorators.map((it) => `@${it}`).join(' ')
            result += ' '
        }

        result += `def ${this.name}(${this.parameters.map((it) => it.name).join(', ')})`

        return result
    }
}
