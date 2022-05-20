import {CompoundFilter} from "./CompoundFilter";
import PythonHasNameFilter from "./PythonHasName";
import AbstractPythonFilter from "./AbstractPythonFilter";

export function createFilterFromString(filterBoxInput: string): AbstractPythonFilter {
    const filters = []

    for (const match of filterBoxInput.matchAll(/(\w+):([^\s:]+)/gu)) {
        if (match.length === 3) {
            const [, scope, filterString] = match;

            switch (scope) {
                case 'hasName':
                    filters.push(new PythonHasNameFilter(filterString))
                    break;
                // no default
            }
        }
    }

    return new CompoundFilter(filters);
}
