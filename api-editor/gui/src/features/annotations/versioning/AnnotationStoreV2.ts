import {
    AnnotationStore as AnnotationStoreV1,
    AttributeAnnotation as AttributeAnnotationV1,
    ConstantAnnotation as ConstantAnnotationV1,
    OptionalAnnotation as OptionalAnnotationV1,
    RequiredAnnotation as RequiredAnnotationV1,
} from './AnnotationStoreV1';
import { VersionedAnnotationStore } from './VersionedAnnotationStore';

export interface AnnotationStore extends VersionedAnnotationStore {
    schemaVersion: 2;
    boundaryAnnotations: {
        [target: string]: BoundaryAnnotation;
    };
    calledAfterAnnotations: {
        [target: string]: { [calledAfterName: string]: CalledAfterAnnotation };
    };
    completeAnnotations: {
        [target: string]: CompleteAnnotation;
    };
    descriptionAnnotations: {
        [target: string]: DescriptionAnnotation;
    };
    enumAnnotations: {
        [target: string]: EnumAnnotation;
    };
    expertAnnotations: {
        [target: string]: ExpertAnnotation;
    };
    groupAnnotations: {
        [target: string]: { [groupName: string]: GroupAnnotation };
    };
    moveAnnotations: {
        [target: string]: MoveAnnotation;
    };
    pureAnnotations: {
        [target: string]: PureAnnotation;
    };
    renameAnnotations: {
        [target: string]: RenameAnnotation;
    };
    removeAnnotations: {
        [target: string]: RemoveAnnotation;
    };
    todoAnnotations: {
        [target: string]: TodoAnnotation;
    };
    valueAnnotations: {
        [target: string]: ValueAnnotation;
    };
}

export interface Annotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Usernames of people who created or changed the annotation.
     */
    readonly authors?: string[];

    /**
     * Usernames of people who marked the annotation as correct.
     */
    readonly reviewers?: string[];

    /**
     * How the reviewer judged this annotation.
     */
    readonly reviewResult?: ReviewResult;

    /**
     * Whether the annotation was deleted. This is used for autogenerated annotations. Others are delete outright.
     */
    readonly isRemoved?: boolean;

    /**
     * Additional information about the annotation.
     */
    readonly comment?: string;
}

export enum ReviewResult {
    Correct = 'correct',
    Unsure = 'unsure',
    Wrong = 'wrong',
}

export interface BoundaryAnnotation extends Annotation {
    /**
     * The interval specifying possible numeric values
     */
    readonly interval: Interval;
}

export interface Interval {
    /**
     * Whether the type of the interval is discrete or continuous
     */
    readonly isDiscrete: boolean;

    /**
     * Lower interval limit
     */
    readonly lowerIntervalLimit: number;

    /**
     * Whether the lower interval limit is inclusive or exclusive
     */
    readonly lowerLimitType: ComparisonOperator;

    /**
     * Upper interval limit
     */
    readonly upperIntervalLimit: number;

    /**
     * Whether the upper interval limit is inclusive or exclusive
     */
    readonly upperLimitType: ComparisonOperator;
}

export enum ComparisonOperator {
    LESS_THAN_OR_EQUALS,
    LESS_THAN,
    UNRESTRICTED,
}

export interface CalledAfterAnnotation extends Annotation {
    /**
     * Name of the callable to be called first
     */
    readonly calledAfterName: string;
}

export interface CalledAfterTarget {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Name of the callable to be called first
     */
    readonly calledAfterName: string;
}

/**
 * The element is fully annotated and all annotations are checked.
 *
 * **Important:** While this is implemented as an annotation it should **not** be counted in the heat map or the
 * statistics.
 */
export interface CompleteAnnotation extends Annotation {}

export interface DescriptionAnnotation extends Annotation {
    /**
     * Description for the declaration.
     */
    readonly newDescription: string;
}

export interface EnumAnnotation extends Annotation {
    /**
     * Name of the enum class that should be created.
     */
    readonly enumName: string;
    readonly pairs: EnumPair[];
}

export interface EnumPair {
    readonly stringValue: string;
    readonly instanceName: string;
}

export interface ExpertAnnotation extends Annotation {}

export interface GroupAnnotation extends Annotation {
    /**
     * Name of the grouped object
     */
    readonly groupName: string;

    /**
     * Parameters to group
     */
    readonly parameters: string[];
}

export interface GroupTarget {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Name of the grouped object
     */
    readonly groupName: string;
}

export interface MoveAnnotation extends Annotation {
    /**
     * Qualified path to the destination
     */
    readonly destination: string;
}

export interface PureAnnotation extends Annotation {}

export interface RenameAnnotation extends Annotation {
    /**
     * New name for the declaration.
     */
    readonly newName: string;
}

export interface RemoveAnnotation extends Annotation {}

export interface TodoAnnotation extends Annotation {
    /**
     * A Todo for the declaration.
     */
    readonly newTodo: string;
}

export interface ValueAnnotation extends Annotation {
    readonly variant: ValueAnnotationVariant;
    readonly defaultValueType?: DefaultValueType;
    readonly defaultValue?: DefaultValue;
}

export type ValueAnnotationVariant = 'constant' | 'omitted' | 'optional' | 'required';
export type DefaultValueType = 'string' | 'number' | 'boolean' | 'none';
export type DefaultValue = string | number | boolean | null;

export const migrateAnnotationStoreV1ToV2 = function (oldAnnotationStore: AnnotationStoreV1): AnnotationStore {
    return {
        schemaVersion: 2,
        boundaryAnnotations: oldAnnotationStore.boundaries ?? {},
        calledAfterAnnotations: oldAnnotationStore.calledAfters ?? {},
        completeAnnotations: oldAnnotationStore.completes ?? {},
        descriptionAnnotations: oldAnnotationStore.descriptions ?? {},
        enumAnnotations: oldAnnotationStore.enums ?? {},
        expertAnnotations: {},
        groupAnnotations: oldAnnotationStore.groups ?? {},
        moveAnnotations: oldAnnotationStore.moves ?? {},
        pureAnnotations: oldAnnotationStore.pures ?? {},
        removeAnnotations: oldAnnotationStore.removes ?? {},
        renameAnnotations: oldAnnotationStore.renamings ?? {},
        todoAnnotations: oldAnnotationStore.todos ?? {},
        valueAnnotations: Object.fromEntries([
            ...Object.entries(oldAnnotationStore.attributes ?? {}).map(([target, oldAnnotation]) => [
                target,
                migrateAttributeAnnotationV1ToV2(oldAnnotation),
            ]),
            ...Object.entries(oldAnnotationStore.constants ?? {}).map(([target, oldAnnotation]) => [
                target,
                migrateConstantAnnotationV1ToV2(oldAnnotation),
            ]),
            ...Object.entries(oldAnnotationStore.optionals ?? {}).map(([target, oldAnnotation]) => [
                target,
                migrateOptionalAnnotationV1ToV2(oldAnnotation),
            ]),
            ...Object.entries(oldAnnotationStore.requireds ?? {}).map(([target, oldAnnotation]) => [
                target,
                migrateRequiredAnnotationV1ToV2(oldAnnotation),
            ]),

            // Annotations that are not removed have precedence
            ...Object.entries(oldAnnotationStore.attributes ?? {})
                .filter(([_, it]) => !it.isRemoved)
                .map(([target, oldAnnotation]) => [target, migrateAttributeAnnotationV1ToV2(oldAnnotation)]),
            ...Object.entries(oldAnnotationStore.constants ?? {})
                .filter(([_, it]) => !it.isRemoved)
                .map(([target, oldAnnotation]) => [target, migrateConstantAnnotationV1ToV2(oldAnnotation)]),
            ...Object.entries(oldAnnotationStore.optionals ?? {})
                .filter(([_, it]) => !it.isRemoved)
                .map(([target, oldAnnotation]) => [target, migrateOptionalAnnotationV1ToV2(oldAnnotation)]),
            ...Object.entries(oldAnnotationStore.requireds ?? {})
                .filter(([_, it]) => !it.isRemoved)
                .map(([target, oldAnnotation]) => [target, migrateRequiredAnnotationV1ToV2(oldAnnotation)]),
        ]),
    };
};

const migrateAttributeAnnotationV1ToV2 = function (oldAttributeAnnotation: AttributeAnnotationV1): ValueAnnotation {
    return {
        target: oldAttributeAnnotation.target,
        authors: oldAttributeAnnotation.authors,
        reviewers: oldAttributeAnnotation.reviewers,
        isRemoved: oldAttributeAnnotation.isRemoved,
        variant: 'optional',
        defaultValueType: oldAttributeAnnotation.defaultType,
        defaultValue: oldAttributeAnnotation.defaultValue,
    };
};

const migrateConstantAnnotationV1ToV2 = function (oldConstantAnnotation: ConstantAnnotationV1): ValueAnnotation {
    return {
        target: oldConstantAnnotation.target,
        authors: oldConstantAnnotation.authors,
        reviewers: oldConstantAnnotation.reviewers,
        isRemoved: oldConstantAnnotation.isRemoved,
        variant: 'constant',
        defaultValueType: oldConstantAnnotation.defaultType,
        defaultValue: oldConstantAnnotation.defaultValue,
    };
};

const migrateOptionalAnnotationV1ToV2 = function (oldOptionalAnnotation: OptionalAnnotationV1): ValueAnnotation {
    return {
        target: oldOptionalAnnotation.target,
        authors: oldOptionalAnnotation.authors,
        reviewers: oldOptionalAnnotation.reviewers,
        isRemoved: oldOptionalAnnotation.isRemoved,
        variant: 'optional',
        defaultValueType: oldOptionalAnnotation.defaultType,
        defaultValue: oldOptionalAnnotation.defaultValue,
    };
};

const migrateRequiredAnnotationV1ToV2 = function (oldRequiredAnnotation: RequiredAnnotationV1): ValueAnnotation {
    return {
        target: oldRequiredAnnotation.target,
        authors: oldRequiredAnnotation.authors,
        reviewers: oldRequiredAnnotation.reviewers,
        isRemoved: oldRequiredAnnotation.isRemoved,
        variant: 'required',
    };
};
