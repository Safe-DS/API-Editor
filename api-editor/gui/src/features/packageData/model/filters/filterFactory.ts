import { ConjunctiveFilter } from './ConjunctiveFilter';
import { NameFilter } from './NameFilter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { DeclarationType, DeclarationTypeFilter } from './DeclarationTypeFilter';
import { Visibility, VisibilityFilter } from './VisibilityFilter';
import { NegatedFilter } from './NegatedFilter';
import { Optional } from '../../../../common/util/types';
import { AnnotationFilter, AnnotationType } from './AnnotationFilter';
import { UsageFilter } from './UsageFilter';
import { UsefulnessFilter } from './UsefulnessFilter';
import { equals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual } from './comparisons';
import { ParameterAssignmentFilter } from './ParameterAssignmentFilter';
import { PythonParameterAssignment } from '../PythonParameter';
import { RequiredOrOptional, RequiredOrOptionalFilter } from './RequiredOrOptionalFilter';

/**
 * Creates a filter from the given string. This method handles conjunctions, negations, and non-negated tokens.
 *
 * @param text The text that describes the filter.
 */
export const createFilterFromString = function (text: string): AbstractPythonFilter {
    const filters: AbstractPythonFilter[] = [];

    for (const token of text.split(/\s+/u)) {
        const newFilter = parsePotentiallyNegatedToken(token);
        if (newFilter) {
            filters.push(newFilter);
        }
    }

    return new ConjunctiveFilter(filters);
};

/**
 * Handles a single token that could be negated.
 *
 * @param token The text that describes the filter.
 */
const parsePotentiallyNegatedToken = function (token: string): Optional<AbstractPythonFilter> {
    const isNegated = token.startsWith('!');
    const positiveToken = isNegated ? token.substring(1) : token;

    const newPositiveFilter = parsePositiveToken(positiveToken);
    if (!newPositiveFilter || !isNegated) {
        return newPositiveFilter;
    } else {
        return new NegatedFilter(newPositiveFilter);
    }
};

/**
 * Handles a singe non-negated token.
 *
 * @param token The text that describes the filter.
 */
const parsePositiveToken = function (token: string): Optional<AbstractPythonFilter> {
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

        // Parameter required or optional
        case 'is:required':
            return new RequiredOrOptionalFilter(RequiredOrOptional.Required);
        case 'is:optional':
            return new RequiredOrOptionalFilter(RequiredOrOptional.Optional);

        // Parameter assignment
        case 'is:implicit':
            return new ParameterAssignmentFilter(PythonParameterAssignment.IMPLICIT);
        case 'is:positiononly':
            return new ParameterAssignmentFilter(PythonParameterAssignment.POSITION_ONLY);
        case 'is:positionorname':
            return new ParameterAssignmentFilter(PythonParameterAssignment.POSITION_OR_NAME);
        case 'is:nameonly':
            return new ParameterAssignmentFilter(PythonParameterAssignment.NAME_ONLY);

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
        case 'annotation:@remove':
            return new AnnotationFilter(AnnotationType.Remove);
        case 'annotation:@rename':
            return new AnnotationFilter(AnnotationType.Rename);
        case 'annotation:@required':
            return new AnnotationFilter(AnnotationType.Required);
    }

    // Name
    const nameMatch = /^name:(?<name>\w+)$/u.exec(token);
    if (nameMatch) {
        return new NameFilter(nameMatch?.groups?.name as string);
    }

    // Usages
    const usageMatch = /^usages(?<comparison>:(<|<=|>=|>)?)(?<expected>\d+)$/u.exec(token);
    if (usageMatch) {
        const comparisonOperator = usageMatch?.groups?.comparison as string;
        const comparison = comparisonFunction(comparisonOperator);
        if (!comparison) {
            return;
        }

        const expected = Number.parseInt(usageMatch?.groups?.expected as string, 10);

        return new UsageFilter(comparison, expected);
    }

    // Usefulness
    const usefulnessMatch = /^usefulness(?<comparison>:(<|<=|>=|>)?)(?<expected>\d+)$/u.exec(token);
    if (usefulnessMatch) {
        const comparisonOperator = usefulnessMatch?.groups?.comparison as string;
        const comparison = comparisonFunction(comparisonOperator);
        if (!comparison) {
            return;
        }

        const expected = Number.parseInt(usefulnessMatch?.groups?.expected as string, 10);

        return new UsefulnessFilter(comparison, expected);
    }
};

const comparisonFunction = function (comparisonOperator: string): ((a: number, b: number) => boolean) | null {
    switch (comparisonOperator) {
        case ':<':
            return lessThan;
        case ':<=':
            return lessThanOrEqual;
        case ':':
            return equals;
        case ':>=':
            return greaterThanOrEqual;
        case ':>':
            return greaterThan;
        default:
            return null;
    }
};

/**
 * Returns whether the given token describes a valid filter. Note that the entire filter string contains multiple
 * tokens, which are separated by commas.
 *
 * @param token The token to check.
 */
export const isValidFilterToken = function (token: string): boolean {
    return Boolean(parsePotentiallyNegatedToken(token));
};
