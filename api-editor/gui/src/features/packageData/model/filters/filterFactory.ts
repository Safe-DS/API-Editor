import {ConjunctiveFilter} from "./ConjunctiveFilter";
import HasNameFilter from "./HasNameFilter";
import AbstractPythonFilter from "./AbstractPythonFilter";
import DeclarationTypeFilter, {DeclarationType} from "./DeclarationTypeFilter";

export function createFilterFromString(filterBoxInput: string): AbstractPythonFilter {
    const filters = []

    for (const match of filterBoxInput.matchAll(/(\w+):([^\s:]+)/gu)) {
        if (match.length === 3) {
            const [, scope, filterString] = match;

            switch (scope) {
                case 'hasName':
                    filters.push(new HasNameFilter(filterString))
                    break;
                case 'is':
                    switch (filterString) {
                        case 'module':
                            filters.push(new DeclarationTypeFilter(DeclarationType.Module))
                            break
                        case 'class':
                            filters.push(new DeclarationTypeFilter(DeclarationType.Class))
                            break
                        case 'function':
                            filters.push(new DeclarationTypeFilter(DeclarationType.Function))
                            break
                        case 'parameter':
                            filters.push(new DeclarationTypeFilter(DeclarationType.Parameter))
                            break
                        // no default
                    }

                    break;
                // no default
            }
        }
    }

    return new ConjunctiveFilter(filters);
}
