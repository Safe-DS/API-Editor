import { Button, ButtonGroup, Icon, IconButton, Stack, Text as ChakraText, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaCheck, FaFlag, FaTrash, FaWrench } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    Annotation,
    BoundaryAnnotation,
    ComparisonOperator,
    DefaultType,
    DefaultValue,
    removeAttribute,
    removeBoundary,
    removeCalledAfter,
    removeConstant,
    removeDescription,
    removeEnum,
    removeGroup,
    removeMove,
    removeOptional,
    removePure,
    removeRemove,
    removeRenaming,
    removeRequired,
    removeTodo,
    reviewAttribute,
    reviewBoundary,
    reviewCalledAfter,
    reviewConstant,
    reviewDescription,
    reviewEnum,
    reviewGroup,
    reviewMove,
    reviewOptional,
    reviewPure,
    reviewRemove,
    reviewRenaming,
    reviewRequired,
    reviewTodo,
    selectAttribute,
    selectBoundary,
    selectCalledAfters,
    selectConstant,
    selectDescription,
    selectEnum,
    selectGroups,
    selectMove,
    selectOptional,
    selectPure,
    selectRemove,
    selectRenaming,
    selectRequired,
    selectTodo,
    selectUsernameIsValid,
} from './annotationSlice';
import {
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showConstantAnnotationForm,
    showDescriptionAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    showTodoAnnotationForm,
} from '../ui/uiSlice';
import { truncate } from '../../common/util/stringOperations';
import { wrongAnnotationURL } from '../externalLinks/urlBuilder';

interface AnnotationViewProps {
    target: string;
}

export const AnnotationView: React.FC<AnnotationViewProps> = function ({ target }) {
    const dispatch = useAppDispatch();

    const attributeAnnotation = useAppSelector(selectAttribute(target));
    const boundaryAnnotation = useAppSelector(selectBoundary(target));
    const calledAfterAnnotation = useAppSelector(selectCalledAfters(target));
    const constantAnnotation = useAppSelector(selectConstant(target));
    const descriptionAnnotation = useAppSelector(selectDescription(target));
    const enumAnnotation = useAppSelector(selectEnum(target));
    const groupAnnotations = useAppSelector(selectGroups(target));
    const moveAnnotation = useAppSelector(selectMove(target));
    const optionalAnnotation = useAppSelector(selectOptional(target));
    const pureAnnotation = useAppSelector(selectPure(target));
    const removeAnnotation = useAppSelector(selectRemove(target));
    const renameAnnotation = useAppSelector(selectRenaming(target));
    const requiredAnnotation = useAppSelector(selectRequired(target));
    const todoAnnotation = useAppSelector(selectTodo(target));

    if (
        !attributeAnnotation &&
        !boundaryAnnotation &&
        !calledAfterAnnotation &&
        !constantAnnotation &&
        !descriptionAnnotation &&
        !enumAnnotation &&
        !groupAnnotations &&
        !moveAnnotation &&
        !optionalAnnotation &&
        !pureAnnotation &&
        !removeAnnotation &&
        !renameAnnotation &&
        !requiredAnnotation &&
        !todoAnnotation
    ) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <Stack maxW="fit-content">
            {attributeAnnotation && (
                <AnnotationTag
                    type="attribute"
                    name={valueToString(attributeAnnotation.defaultValue, attributeAnnotation.defaultType)}
                    annotation={attributeAnnotation}
                    onEdit={() => dispatch(showAttributeAnnotationForm(target))}
                    onDelete={() => dispatch(removeAttribute(target))}
                    onReview={() => {
                        dispatch(reviewAttribute(target));
                    }}
                />
            )}
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
            {constantAnnotation && (
                <AnnotationTag
                    type="constant"
                    name={valueToString(constantAnnotation.defaultValue, constantAnnotation.defaultType)}
                    annotation={constantAnnotation}
                    onEdit={() => dispatch(showConstantAnnotationForm(target))}
                    onDelete={() => dispatch(removeConstant(target))}
                    onReview={() => {
                        dispatch(reviewConstant(target));
                    }}
                    reportable
                />
            )}
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
            {optionalAnnotation && (
                <AnnotationTag
                    type="optional"
                    name={valueToString(optionalAnnotation.defaultValue, optionalAnnotation.defaultType)}
                    annotation={optionalAnnotation}
                    onEdit={() => dispatch(showOptionalAnnotationForm(target))}
                    onDelete={() => dispatch(removeOptional(target))}
                    onReview={() => {
                        dispatch(reviewOptional(target));
                    }}
                    reportable
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
            {requiredAnnotation && (
                <AnnotationTag
                    type="required"
                    annotation={requiredAnnotation}
                    onDelete={() => dispatch(removeRequired(target))}
                    onReview={() => dispatch(reviewRequired(target))}
                    reportable
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
        </Stack>
    );
};

const valueToString = (value: DefaultValue, type: DefaultType): string => {
    switch (type) {
        case 'string':
            return `"${value}"`;
        case 'number':
            return String(value);
        case 'boolean':
            return value === true ? 'True' : 'False';
        case 'none':
            return 'None';
    }
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
    const isValidUsername = useAppSelector(selectUsernameIsValid);
    const isCorrect = (annotation.reviewers?.length ?? 0) > 0;
    const authors = annotation.authors ?? [];
    const isReportable = reportable && authors.length === 1 && authors.includes('$autogen$');

    return (
        <ButtonGroup size="sm" variant="outline" isAttached>
            <IconButton
                icon={<FaTrash />}
                aria-label="Delete annotation"
                colorScheme="red"
                disabled={!isValidUsername || isCorrect}
                onClick={onDelete}
            />
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
                        : {name}
                    </ChakraText>
                )}
            </Button>
            {isCorrect ? (
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
            ) : (
                <Button size="sm" variant="outline" disabled={!isValidUsername} onClick={onReview}>
                    Mark as Correct
                </Button>
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
