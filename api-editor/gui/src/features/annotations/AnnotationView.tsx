import { Button, ButtonGroup, Icon, IconButton, Stack, Text as ChakraText, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaCheck, FaFlag, FaTrash, FaWrench } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    removeBoundary,
    removeCalledAfter,
    removeDescription,
    removeEnum,
    removeGroup,
    removeMove,
    removePure,
    removeRemove,
    removeRenaming,
    removeTodo,
    removeValue,
    reviewBoundary,
    reviewCalledAfter,
    reviewDescription,
    reviewEnum,
    reviewGroup,
    reviewMove,
    reviewPure,
    reviewRemove,
    reviewRenaming,
    reviewTodo,
    reviewValue,
    selectBoundaryAnnotation,
    selectCalledAfterAnnotations,
    selectDescriptionAnnotation,
    selectEnumAnnotation,
    selectGroupAnnotations,
    selectMoveAnnotation,
    selectPureAnnotation,
    selectRemoveAnnotation,
    selectRenameAnnotation,
    selectTodoAnnotation,
    selectUsernameIsValid,
    selectValueAnnotation,
} from './annotationSlice';
import {
    hideAnnotationForm,
    selectCurrentUserAction,
    showBoundaryAnnotationForm,
    showDescriptionAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showRenameAnnotationForm,
    showTodoAnnotationForm,
    showValueAnnotationForm,
} from '../ui/uiSlice';
import { truncate } from '../../common/util/stringOperations';
import { wrongAnnotationURL } from '../externalLinks/urlBuilder';
import { Annotation, BoundaryAnnotation, ComparisonOperator, ValueAnnotation } from './versioning/AnnotationStoreV2';

interface AnnotationViewProps {
    target: string;
}

export const AnnotationView: React.FC<AnnotationViewProps> = function ({ target }) {
    const dispatch = useAppDispatch();

    const boundaryAnnotation = useAppSelector(selectBoundaryAnnotation(target));
    const calledAfterAnnotation = useAppSelector(selectCalledAfterAnnotations(target));
    const descriptionAnnotation = useAppSelector(selectDescriptionAnnotation(target));
    const enumAnnotation = useAppSelector(selectEnumAnnotation(target));
    const groupAnnotations = useAppSelector(selectGroupAnnotations(target));
    const moveAnnotation = useAppSelector(selectMoveAnnotation(target));
    const pureAnnotation = useAppSelector(selectPureAnnotation(target));
    const removeAnnotation = useAppSelector(selectRemoveAnnotation(target));
    const renameAnnotation = useAppSelector(selectRenameAnnotation(target));
    const todoAnnotation = useAppSelector(selectTodoAnnotation(target));
    const valueAnnotation = useAppSelector(selectValueAnnotation(target));

    if (
        !boundaryAnnotation &&
        !calledAfterAnnotation &&
        !descriptionAnnotation &&
        !enumAnnotation &&
        !groupAnnotations &&
        !moveAnnotation &&
        !pureAnnotation &&
        !removeAnnotation &&
        !renameAnnotation &&
        !todoAnnotation &&
        !valueAnnotation
    ) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <Stack maxW="fit-content">
            {boundaryAnnotation && (
                <AnnotationTag
                    type="boundary"
                    name={boundaryToString(boundaryAnnotation)}
                    annotation={boundaryAnnotation}
                    onEdit={() => dispatch(showBoundaryAnnotationForm(target))}
                    onDelete={() => dispatch(removeBoundary(target))}
                    onReview={() => {
                        dispatch(reviewBoundary(target));
                    }}
                    reportable
                />
            )}
            {Object.keys(calledAfterAnnotation).map((calledAfterName) => (
                <AnnotationTag
                    type="calledAfter"
                    name={calledAfterName}
                    key={calledAfterName}
                    annotation={calledAfterAnnotation[calledAfterName]}
                    onDelete={() => dispatch(removeCalledAfter({ target, calledAfterName }))}
                    onReview={() => dispatch(reviewCalledAfter({ target, calledAfterName }))}
                />
            ))}
            {descriptionAnnotation && (
                <AnnotationTag
                    type="description"
                    annotation={descriptionAnnotation}
                    onEdit={() => dispatch(showDescriptionAnnotationForm(target))}
                    onDelete={() => dispatch(removeDescription(target))}
                    onReview={() => {
                        dispatch(reviewDescription(target));
                    }}
                />
            )}
            {enumAnnotation && (
                <AnnotationTag
                    type="enum"
                    name={enumAnnotation.enumName}
                    annotation={enumAnnotation}
                    onEdit={() => dispatch(showEnumAnnotationForm(target))}
                    onDelete={() => dispatch(removeEnum(target))}
                    onReview={() => {
                        dispatch(reviewEnum(target));
                    }}
                    reportable
                />
            )}
            {Object.keys(groupAnnotations).map((groupName) => (
                <AnnotationTag
                    key={groupName}
                    type="group"
                    name={groupName}
                    annotation={groupAnnotations[groupName]}
                    onEdit={() => dispatch(showGroupAnnotationForm({ target, groupName }))}
                    onDelete={() => dispatch(removeGroup({ target, groupName }))}
                    onReview={() => dispatch(reviewGroup({ target, groupName }))}
                />
            ))}
            {moveAnnotation && (
                <AnnotationTag
                    type="move"
                    name={moveAnnotation.destination}
                    annotation={moveAnnotation}
                    onEdit={() => dispatch(showMoveAnnotationForm(target))}
                    onDelete={() => dispatch(removeMove(target))}
                    onReview={() => {
                        dispatch(reviewMove(target));
                    }}
                />
            )}
            {pureAnnotation && (
                <AnnotationTag
                    type="pure"
                    annotation={pureAnnotation}
                    onDelete={() => dispatch(removePure(target))}
                    onReview={() => dispatch(reviewPure(target))}
                />
            )}
            {removeAnnotation && (
                <AnnotationTag
                    type="remove"
                    annotation={removeAnnotation}
                    onDelete={() => dispatch(removeRemove(target))}
                    onReview={() => dispatch(reviewRemove(target))}
                    reportable
                />
            )}
            {renameAnnotation && (
                <AnnotationTag
                    type="rename"
                    name={renameAnnotation.newName}
                    annotation={renameAnnotation}
                    onEdit={() => dispatch(showRenameAnnotationForm(target))}
                    onDelete={() => dispatch(removeRenaming(target))}
                    onReview={() => {
                        dispatch(reviewRenaming(target));
                    }}
                />
            )}
            {todoAnnotation && (
                <AnnotationTag
                    type="todo"
                    name={truncate(todoAnnotation.newTodo, 50)}
                    annotation={todoAnnotation}
                    onEdit={() => dispatch(showTodoAnnotationForm(target))}
                    onDelete={() => dispatch(removeTodo(target))}
                    onReview={() => dispatch(reviewTodo(target))}
                />
            )}
            {valueAnnotation && (
                <AnnotationTag
                    type="value"
                    name={valueAnnotationToString(valueAnnotation)}
                    annotation={valueAnnotation}
                    onEdit={() => dispatch(showValueAnnotationForm(target))}
                    onDelete={() => dispatch(removeValue(target))}
                    onReview={() => dispatch(reviewValue(target))}
                    reportable
                />
            )}
        </Stack>
    );
};

const valueAnnotationToString = (valueAnnotation: ValueAnnotation): string => {
    let result = '';

    if (valueAnnotation.variant === 'constant') {
        result += 'constant';
    } else if (valueAnnotation.variant === 'optional') {
        result += 'optional with default';
    } else if (valueAnnotation.variant === 'required') {
        result += 'required';
    }

    if (valueAnnotation.variant !== 'required') {
        if (valueAnnotation.defaultValueType === 'string') {
            result += ` "${valueAnnotation.defaultValue}"`;
        } else if (valueAnnotation.defaultValueType === 'number') {
            result += ' ' + String(valueAnnotation.defaultValue);
        } else if (valueAnnotation.defaultValueType === 'boolean') {
            result += valueAnnotation.defaultValue === true ? ' True' : ' False';
        } else if (valueAnnotation.defaultValueType === 'none') {
            result += ' None';
        }
    }

    return result;
};

const boundaryToString = (boundary: BoundaryAnnotation) => {
    const interval = boundary.interval;
    let result = '{x ∈ ';

    result += interval.isDiscrete ? 'ℤ' : 'ℝ';
    result += ' | ';

    if (interval.lowerLimitType === ComparisonOperator.LESS_THAN_OR_EQUALS) {
        result += `${interval.lowerIntervalLimit} ≤ `;
    } else if (interval.lowerLimitType === ComparisonOperator.LESS_THAN) {
        result += `${interval.lowerIntervalLimit} < `;
    }

    result += 'x';

    if (interval.upperLimitType === ComparisonOperator.LESS_THAN_OR_EQUALS) {
        result += ` ≤ ${interval.upperIntervalLimit}`;
    } else if (interval.upperLimitType === ComparisonOperator.LESS_THAN) {
        result += ` < ${interval.upperIntervalLimit}`;
    }

    result += '}';
    return result;
};

interface AnnotationTagProps {
    type: string;
    name?: string;
    annotation: Annotation;
    onEdit?: () => void;
    onDelete: () => void;
    onReview: () => void;
    reportable?: boolean;
}

const AnnotationTag: React.FC<AnnotationTagProps> = function ({
    type,
    name,
    annotation,
    onDelete,
    onEdit,
    onReview,
    reportable = false,
}) {
    const dispatch = useAppDispatch();
    const isValidUsername = useAppSelector(selectUsernameIsValid);
    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const reviewer = (annotation.reviewers ?? [])[0];
    const isCorrect = reviewer !== undefined;
    const authors = annotation.authors ?? [];
    const isReportable = reportable && authors.length === 1 && authors.includes('$autogen$');
    const authorText = createAuthorText(authors);

    // Event Handler
    const onMarkAsCorrect = () => {
        onReview();

        if (annotation.target === currentUserAction.target && type === currentUserAction.type) {
            dispatch(hideAnnotationForm());
        }
    };

    // Render
    return (
        <ButtonGroup size="sm" variant="outline" isAttached>
            <Tooltip label={`${authorText}Click to delete.`}>
                <IconButton
                    icon={<FaTrash />}
                    aria-label="Delete annotation"
                    colorScheme="red"
                    disabled={!isValidUsername || isCorrect}
                    onClick={onDelete}
                />
            </Tooltip>
            <Tooltip label={`${authorText}Click to change.`}>
                <Button
                    leftIcon={<FaWrench />}
                    flexGrow={1}
                    borderLeft="none"
                    justifyContent="flex-start"
                    disabled={!onEdit || !isValidUsername || isCorrect}
                    onClick={onEdit}
                >
                    @{type}
                    {name && (
                        <ChakraText as="span" fontWeight="normal" justifySelf="flex-end">
                            : {name} {annotation.isRemoved}
                        </ChakraText>
                    )}
                </Button>
            </Tooltip>
            {isCorrect ? (
                <Tooltip label={`Marked as correct by ${reviewer}. Click to undo.`}>
                    <Button
                        size="sm"
                        variant="solid"
                        colorScheme="green"
                        rightIcon={<Icon as={FaCheck} />}
                        disabled={!isValidUsername}
                        onClick={onReview}
                    >
                        Correct
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label={`${authorText}Click to mark as correct.`}>
                    <Button size="sm" variant="outline" disabled={!isValidUsername} onClick={onMarkAsCorrect}>
                        Mark as Correct
                    </Button>
                </Tooltip>
            )}
            {isReportable && (
                <Tooltip label="Report a wrong autogenerated annotation.">
                    <IconButton
                        icon={<FaFlag />}
                        aria-label="Report Wrong Annotation"
                        colorScheme="orange"
                        disabled={isCorrect || !isValidUsername}
                        onClick={() => {
                            window.open(wrongAnnotationURL(type, annotation), '_blank');
                        }}
                    />
                </Tooltip>
            )}
        </ButtonGroup>
    );
};

const createAuthorText = function (authors: string[]): string {
    let authorText = '';
    if (authors.length > 0) {
        if (authors[0] === '$autogen$') {
            authorText += `Created automatically.`;
        } else {
            authorText += `Created manually by ${authors[0]}.`;
        }
    }
    if (authors.length > 1) {
        authorText += ` Later changed by ${authors.slice(1).join(', ')}.`;
    }
    authorText += ' ';
    return authorText;
};
