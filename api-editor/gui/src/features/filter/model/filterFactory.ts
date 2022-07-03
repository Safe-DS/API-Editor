import { ConjunctiveFilter } from './ConjunctiveFilter';
import { NameStringFilter } from './NameStringFilter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { DeclarationType, DeclarationTypeFilter } from './DeclarationTypeFilter';
import { Visibility, VisibilityFilter } from './VisibilityFilter';
import { NegatedFilter } from './NegatedFilter';
import { Optional } from '../../../common/util/types';
import { AnnotationFilter, AnnotationType } from './AnnotationFilter';
import { UsageFilter } from './UsageFilter';
import { UsefulnessFilter } from './UsefulnessFilter';
import { equals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual } from './comparisons';
import { ParameterAssignmentFilter } from './ParameterAssignmentFilter';
import { RequiredOrOptional, RequiredOrOptionalFilter } from './RequiredOrOptionalFilter';
import { NameRegexFilter } from './NameRegexFilter';
import { DoneFilter } from './DoneFilter';
import { PythonParameterAssignment } from '../../packageData/model/PythonParameter';
import { QualifiedNameStringFilter } from './QualifiedNameStringFilter';
import { QualifiedNameRegexFilter } from './QualifiedNameRegexFilter';

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

const fixedFilters: { [name: string]: AbstractPythonFilter } = {
    // Declaration type
    'is:module': new DeclarationTypeFilter(DeclarationType.Module),
    'is:class': new DeclarationTypeFilter(DeclarationType.Class),
    'is:function': new DeclarationTypeFilter(DeclarationType.Function),
    'is:parameter': new DeclarationTypeFilter(DeclarationType.Parameter),

    // Visibility
    'is:public': new VisibilityFilter(Visibility.Public),
    'is:internal': new VisibilityFilter(Visibility.Internal),

    // Parameter required or optional
    'is:required': new RequiredOrOptionalFilter(RequiredOrOptional.Required),
    'is:optional': new RequiredOrOptionalFilter(RequiredOrOptional.Optional),

    // Parameter assignment
    'is:implicit': new ParameterAssignmentFilter(PythonParameterAssignment.IMPLICIT),
    'is:positiononly': new ParameterAssignmentFilter(PythonParameterAssignment.POSITION_ONLY),
    'is:positionorname': new ParameterAssignmentFilter(PythonParameterAssignment.POSITION_OR_NAME),
    'is:positionalvararg': new ParameterAssignmentFilter(PythonParameterAssignment.POSITIONAL_VARARG),
    'is:nameonly': new ParameterAssignmentFilter(PythonParameterAssignment.NAME_ONLY),
    'is:namedvararg': new ParameterAssignmentFilter(PythonParameterAssignment.NAMED_VARARG),

    // Done
    'is:done': new DoneFilter(),

    // Annotations
    'annotation:any': new AnnotationFilter(AnnotationType.Any),
    'annotation:@boundary': new AnnotationFilter(AnnotationType.Boundary),
    'annotation:@calledafter': new AnnotationFilter(AnnotationType.CalledAfter),
    'is:complete': new AnnotationFilter(AnnotationType.Complete), // Deliberate special case. It should be transparent to users it's an annotation.
    'annotation:@description': new AnnotationFilter(AnnotationType.Description),
    'annotation:@enum': new AnnotationFilter(AnnotationType.Enum),
    'annotation:@group': new AnnotationFilter(AnnotationType.Group),
    'annotation:@move': new AnnotationFilter(AnnotationType.Move),
    'annotation:@pure': new AnnotationFilter(AnnotationType.Pure),
    'annotation:@remove': new AnnotationFilter(AnnotationType.Remove),
    'annotation:@rename': new AnnotationFilter(AnnotationType.Rename),
    'annotation:@todo': new AnnotationFilter(AnnotationType.Todo),
    'annotation:@value': new AnnotationFilter(AnnotationType.Value),
};

/**
 * Handles a singe non-negated token.
 *
 * @param token The text that describes the filter.
 */
const parsePositiveToken = function (token: string): Optional<AbstractPythonFilter> {
    // Fixed filters
    const fixedFilter = fixedFilters[token.toLowerCase()];
    if (fixedFilter) {
        return fixedFilter;
    }

    // Name
    const nameStringMatch = /^name:(?<comparison>[=~])(?<name>\w+)$/u.exec(token);
    if (nameStringMatch) {
        const comparisonOperator = nameStringMatch?.groups?.comparison as string;
        return new NameStringFilter(nameStringMatch?.groups?.name as string, comparisonOperator === '=');
    }

    const nameRegexMatch = /^name:\/(?<regex>.*)\/$/u.exec(token);
    if (nameRegexMatch) {
        try {
            return new NameRegexFilter(nameRegexMatch?.groups?.regex as string);
        } catch (e) {
            return undefined;
        }
    }

    // Name
    const qualifiedNameStringMatch = /^qname:(?<comparison>[=~])(?<qname>[\w.]+)$/u.exec(token);
    if (qualifiedNameStringMatch) {
        const comparisonOperator = qualifiedNameStringMatch?.groups?.comparison as string;
        return new QualifiedNameStringFilter(
            qualifiedNameStringMatch?.groups?.qname as string,
            comparisonOperator === '=',
        );
    }

    const qualifiedNameRegexMatch = /^qname:\/(?<regex>.*)\/$/u.exec(token);
    if (qualifiedNameRegexMatch) {
        try {
            return new QualifiedNameRegexFilter(qualifiedNameRegexMatch?.groups?.regex as string);
        } catch (e) {
            return undefined;
        }
    }

    // Usages
    const usageMatch = /^usages:(?<comparison>(<|<=|=|>=|>)?)(?<expected>\d+)$/u.exec(token);
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
    const usefulnessMatch = /^usefulness:(?<comparison>(<|<=|=|>=|>)?)(?<expected>\d+)$/u.exec(token);
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
        case '<':
            return lessThan;
        case '<=':
            return lessThanOrEqual;
        case '=':
            return equals;
        case '>=':
            return greaterThanOrEqual;
        case '>':
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

/**
 * Returns the names of all fixed filter like "annotation:any".
 */
export const getFixedFilterNames = function (): string[] {
    return Object.keys(fixedFilters);
}
