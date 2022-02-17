import {
    Button,
    ButtonGroup,
    IconButton,
    Stack,
    Text as ChakraText,
} from '@chakra-ui/react';
import React from 'react';
import {FaTrash, FaWrench} from 'react-icons/fa';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {
    BoundaryAnnotation,
    ComparisonOperator,
    DefaultType,
    DefaultValue,
    removeAttribute,
    removeBoundary,
    removeCalledAfter,
    removeConstant,
    removeEnum,
    removeGroup,
    removeMove,
    removeOptional,
    removePure,
    removeRenaming,
    removeRequired,
    removeUnused,
    selectAttribute,
    selectBoundary,
    selectCalledAfters,
    selectConstant,
    selectEnum,
    selectGroups,
    selectMove,
    selectOptional,
    selectPure,
    selectRenaming,
    selectRequired,
    selectUnused,
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
} from './annotationSlice';

interface AnnotationViewProps {
    target: string;
}

const AnnotationView: React.FC<AnnotationViewProps> = function ({target}) {
    const dispatch = useAppDispatch();

    const attributeAnnotation = useAppSelector(selectAttribute(target));
    const boundaryAnnotation = useAppSelector(selectBoundary(target));
    const calledAfterAnnotation = useAppSelector(selectCalledAfters(target));
    const constantAnnotation = useAppSelector(selectConstant(target));
    const enumAnnotation = useAppSelector(selectEnum(target));
    const groupAnnotations = useAppSelector(selectGroups(target));
    const moveAnnotation = useAppSelector(selectMove(target));
    const optionalAnnotation = useAppSelector(selectOptional(target));
    const pureAnnotation = useAppSelector(selectPure(target));
    const renameAnnotation = useAppSelector(selectRenaming(target));
    const requiredAnnotation = useAppSelector(selectRequired(target));
    const unusedAnnotation = useAppSelector(selectUnused(target));

    if (
        !attributeAnnotation &&
        !boundaryAnnotation &&
        !calledAfterAnnotation &&
        !constantAnnotation &&
        !enumAnnotation &&
        !groupAnnotations &&
        !moveAnnotation &&
        !optionalAnnotation &&
        !pureAnnotation &&
        !renameAnnotation &&
        !requiredAnnotation &&
        !unusedAnnotation
    ) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <Stack maxW="fit-content">
            {attributeAnnotation && (
                <Annotation
                    type="attribute"
                    name={valueToString(
                        attributeAnnotation.defaultValue,
                        attributeAnnotation.defaultType,
                    )}
                    onEdit={() => dispatch(showAttributeAnnotationForm(target))}
                    onDelete={() => dispatch(removeAttribute(target))}
                />
            )}
            {boundaryAnnotation && (
                <Annotation
                    type="boundary"
                    name={boundaryToString(boundaryAnnotation)}
                    onEdit={() => dispatch(showBoundaryAnnotationForm(target))}
                    onDelete={() => dispatch(removeBoundary(target))}
                />
            )}
            {Object.keys(calledAfterAnnotation).map((calledAfterName) => (
                <Annotation
                    type="calledAfter"
                    name={calledAfterName}
                    key={calledAfterName}
                    onDelete={() =>
                        dispatch(removeCalledAfter({target, calledAfterName}))
                    }
                />
            ))}
            {constantAnnotation && (
                <Annotation
                    type="constant"
                    name={valueToString(
                        constantAnnotation.defaultValue,
                        constantAnnotation.defaultType,
                    )}
                    onEdit={() => dispatch(showConstantAnnotationForm(target))}
                    onDelete={() => dispatch(removeConstant(target))}
                />
            )}
            {enumAnnotation && (
                <Annotation
                    type="enum"
                    name={enumAnnotation.enumName}
                    onEdit={() => dispatch(showEnumAnnotationForm(target))}
                    onDelete={() => dispatch(removeEnum(target))}
                />
            )}
            {Object.keys(groupAnnotations).map((groupName) => (
                <Annotation
                    key={groupName}
                    type="group"
                    name={groupName}
                    onEdit={() =>
                        dispatch(showGroupAnnotationForm({target, groupName}))
                    }
                    onDelete={() =>
                        dispatch(removeGroup({target, groupName}))
                    }
                />
            ))}
            {moveAnnotation && (
                <Annotation
                    type="move"
                    name={moveAnnotation.destination}
                    onEdit={() => dispatch(showMoveAnnotationForm(target))}
                    onDelete={() => dispatch(removeMove(target))}
                />
            )}
            {optionalAnnotation && (
                <Annotation
                    type="optional"
                    name={valueToString(
                        optionalAnnotation.defaultValue,
                        optionalAnnotation.defaultType,
                    )}
                    onEdit={() => dispatch(showOptionalAnnotationForm(target))}
                    onDelete={() => dispatch(removeOptional(target))}
                />
            )}
            {pureAnnotation && (
                <Annotation
                    type="pure"
                    onDelete={() => dispatch(removePure(target))}
                />
            )}
            {renameAnnotation && (
                <Annotation
                    type="rename"
                    name={renameAnnotation.newName}
                    onEdit={() => dispatch(showRenameAnnotationForm(target))}
                    onDelete={() => dispatch(removeRenaming(target))}
                />
            )}
            {requiredAnnotation && (
                <Annotation
                    type="required"
                    onDelete={() => dispatch(removeRequired(target))}
                />
            )}
            {unusedAnnotation && (
                <Annotation
                    type="unused"
                    onDelete={() => dispatch(removeUnused(target))}
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
            return "None";
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

interface AnnotationProps {
    type: string;
    name?: string;
    onEdit?: () => void;
    onDelete: () => void;
}

const Annotation: React.FC<AnnotationProps> = function ({
                                                            name,
                                                            onDelete,
                                                            onEdit,
                                                            type,
                                                        }) {
    return (
        <ButtonGroup size="sm" variant="outline" isAttached>
            <Button
                leftIcon={<FaWrench/>}
                flexGrow={1}
                justifyContent="flex-start"
                disabled={!onEdit}
                onClick={onEdit}
            >
                @{type}
                {name && (
                    <ChakraText
                        as="span"
                        fontWeight="normal"
                        justifySelf="flex-end"
                    >
                        : {name}
                    </ChakraText>
                )}
            </Button>
            <IconButton
                icon={<FaTrash/>}
                aria-label="Delete annotation"
                colorScheme="red"
                onClick={onDelete}
            />
        </ButtonGroup>
    );
};

export default AnnotationView;
