import {CompoundFilter} from "./CompoundFilter";
import PythonHasNameFilter from "./PythonHasName";
import AbstractPythonFilter from "./AbstractPythonFilter";
import PythonDeclerationTypeFilter, {DeclerationType} from "./PythonDeclerationType";

export function createFilterFromString(filterBoxInput: string): AbstractPythonFilter {
    const filters = []

    for (const match of filterBoxInput.matchAll(/(\w+):([^\s:]+)/gu)) {
        if (match.length === 3) {
            const [, scope, filterString] = match;

            switch (scope) {
                case 'hasName':
                    filters.push(new PythonHasNameFilter(filterString))
                    break;
                case 'is':
                    switch (filterString) {
                        case 'module':
                            filters.push(new PythonDeclerationTypeFilter(DeclerationType.module))
                            break
                        case 'class':
                            filters.push(new PythonDeclerationTypeFilter(DeclerationType.class))
                            break
                        case 'function':
                            filters.push(new PythonDeclerationTypeFilter(DeclerationType.function))
                            break
                        case 'parameter':
                            filters.push(new PythonDeclerationTypeFilter(DeclerationType.parameter))
                            break
                        // no default
                    }

                    break;
                // no default
            }
        }
    }

    return new CompoundFilter(filters);
}
