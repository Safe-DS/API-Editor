import { ConjunctiveFilter } from './ConjunctiveFilter';
import NameFilter from './NameFilter';
import AbstractPythonFilter from './AbstractPythonFilter';
import DeclarationTypeFilter, { DeclarationType } from './DeclarationTypeFilter';
import VisibilityFilter, { Visibility } from './VisibilityFilter';
import { NegatedFilter } from './NegatedFilter';
import { Optional } from '../../../../common/util/types';
import AnnotationFilter, { AnnotationType } from './AnnotationFilter';

export function createFilterFromString(text: string): AbstractPythonFilter {
    const filters: AbstractPythonFilter[] = [];

    for (const token of text.split(/\s+/)) {
        const newFilter = parsePotentiallyNegatedToken(token);
        if (newFilter) {
            filters.push(newFilter);
        }
    }

    return new ConjunctiveFilter(filters);
}

function parsePotentiallyNegatedToken(token: string): Optional<AbstractPythonFilter> {
    const isNegated = token.startsWith('!');
    const positiveToken = isNegated ? token.substring(1) : token;

    const newPositiveFilter = parsePositiveToken(positiveToken);
    if (!newPositiveFilter || !isNegated) {
        return newPositiveFilter;
    } else {
        return new NegatedFilter(newPositiveFilter);
    }
}

function parsePositiveToken(token: string): Optional<AbstractPythonFilter> {
    // Filters with fixed text
    switch (token.toLowerCase()) {
        // Declaration type
        case 'is:module':
            return new DeclarationTypeFilter(DeclarationType.Module);
        case 'is:class':
            return new DeclarationTypeFilter(DeclarationType.Class);
        case 'is:function':
            return new DeclarationTypeFilter(DeclarationType.Function);
        case 'is:parameter':
            return new DeclarationTypeFilter(DeclarationType.Parameter);

        // Visibility
        case 'is:public':
            return new VisibilityFilter(Visibility.Public);
        case 'is:internal':
            return new VisibilityFilter(Visibility.Internal);

        // Annotations
        case 'annotation:any':
            return new AnnotationFilter(AnnotationType.Any);
        case 'annotation:@attribute':
            return new AnnotationFilter(AnnotationType.Attribute);
        case 'annotation:@boundary':
            return new AnnotationFilter(AnnotationType.Boundary);
        case 'annotation:@calledAfter':
            return new AnnotationFilter(AnnotationType.CalledAfter);
        case 'annotation:@constant':
            return new AnnotationFilter(AnnotationType.Constant);
        case 'annotation:@enum':
            return new AnnotationFilter(AnnotationType.Enum);
        case 'annotation:@group':
            return new AnnotationFilter(AnnotationType.Group);
        case 'annotation:@move':
            return new AnnotationFilter(AnnotationType.Move);
        case 'annotation:@optional':
            return new AnnotationFilter(AnnotationType.Optional);
        case 'annotation:@pure':
            return new AnnotationFilter(AnnotationType.Pure);
        case 'annotation:@renaming':
            return new AnnotationFilter(AnnotationType.Renaming);
        case 'annotation:@required':
            return new AnnotationFilter(AnnotationType.Required);
        case 'annotation:@unused':
            return new AnnotationFilter(AnnotationType.Unused);
    }

    // Name
    const nameMatch = /^name:(?<name>\w+)$/.exec(token);
    if (nameMatch) {
        return new NameFilter(nameMatch?.groups?.name as string);
    }
}
