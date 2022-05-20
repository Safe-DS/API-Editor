import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonFromImport from './PythonFromImport';
import PythonFunction from './PythonFunction';
import PythonImport from './PythonImport';
import PythonPackage from './PythonPackage';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class NullFilter extends AbstractPythonFilter {
    filterModules(pythonModule: PythonModule): boolean {
        return true;
    }

    filterClasses(pythonClass: PythonClass): boolean {
        return true;
    }

    filterFunctions(pythonFunction: PythonFunction): boolean {
        return true;
    }

    filterParameters(pythonParameter: PythonParameter): boolean {
        return true;
    }

    isFilteringModules(): boolean {
        return false;
    }

    isFilteringClasses(): boolean {
        return false;
    }

    isFilteringFunctions(): boolean {
        return false;
    }

    isFilteringParameters(): boolean {
        return false;
    }
}
