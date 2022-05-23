import {ConjunctiveFilter} from './ConjunctiveFilter';
import NameFilter from './NameFilter';
import AbstractPythonFilter from './AbstractPythonFilter';
import DeclarationTypeFilter, {DeclarationType} from './DeclarationTypeFilter';
import VisibilityFilter, {Visibility} from "./VisibilityFilter";

export function createFilterFromString(filterBoxInput: string): AbstractPythonFilter {
    const filters = [];

    for (const token of filterBoxInput.split(/\s+/)) {
        switch (token) {

            // Declaration type
            case 'is:module':
                filters.push(new DeclarationTypeFilter(DeclarationType.Module));
                continue;
            case 'is:class':
                filters.push(new DeclarationTypeFilter(DeclarationType.Class));
                continue;
            case 'is:function':
                filters.push(new DeclarationTypeFilter(DeclarationType.Function));
                continue;
            case 'is:parameter':
                filters.push(new DeclarationTypeFilter(DeclarationType.Parameter));
                continue;

            // Visibility
            case 'is:public':
                filters.push(new VisibilityFilter(Visibility.Public))
                continue
            case 'is:internal':
                filters.push(new VisibilityFilter(Visibility.Internal))
                continue
        }

        // Name
        const nameMatch = /^name:(?<name>\w+)$/.exec(token)
        if (nameMatch) {
            filters.push(new NameFilter(nameMatch?.groups?.name as string))
            // noinspection UnnecessaryContinueJS
            continue
        }
    }

    return new ConjunctiveFilter(filters);
}
