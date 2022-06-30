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
        case 'is:positionalvararg':
            return new ParameterAssignmentFilter(PythonParameterAssignment.POSITIONAL_VARARG);
        case 'is:nameonly':
            return new ParameterAssignmentFilter(PythonParameterAssignment.NAME_ONLY);
        case 'is:namedvararg':
            return new ParameterAssignmentFilter(PythonParameterAssignment.NAMED_VARARG);

        // Done
        case 'is:done':
            return new DoneFilter();

        // Annotations
        case 'annotation:any':
            return new AnnotationFilter(AnnotationType.Any);
        case 'annotation:@attribute':
            return new AnnotationFilter(AnnotationType.Attribute);
        case 'annotation:@boundary':
            return new AnnotationFilter(AnnotationType.Boundary);
        case 'annotation:@calledafter':
            return new AnnotationFilter(AnnotationType.CalledAfter);
        case 'is:complete': // Deliberate special case. It should be transparent to users it's an annotation.
            return new AnnotationFilter(AnnotationType.Complete);
        case 'annotation:@constant':
            return new AnnotationFilter(AnnotationType.Constant);
        case 'annotation:@description':
            return new AnnotationFilter(AnnotationType.Description);
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
        case 'annotation:@todo':
            return new AnnotationFilter(AnnotationType.Todo);
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
