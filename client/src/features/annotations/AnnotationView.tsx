import { Button, ButtonGroup, IconButton, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaTrash, FaWrench } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    boundaryToString,
    removeBoundary,
    removeConstant,
    removeEnum,
    removeOptional,
    removeRenaming,
    removeRequired,
    removeUnused,
    selectConstant,
    selectEnum,
    selectRenaming,
    selectUnused,
    selectRequired,
    selectOptional,
    showBoundaryAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showRenameAnnotationForm,
    showOptionalAnnotationForm,
    selectBoundary,
} from './annotationSlice';

interface AnnotationViewProps {
    target: string;
}

const AnnotationView: React.FC<AnnotationViewProps> = function ({ target }) {
    const dispatch = useAppDispatch();

    const boundaryAnnotation = useAppSelector(selectBoundary(target));
    const constantAnnotation = useAppSelector(selectConstant(target));
    const enumAnnotation = useAppSelector(selectEnum(target));
    const optionalAnnotation = useAppSelector(selectOptional(target));
    const renameAnnotation = useAppSelector(selectRenaming(target));
    const requiredAnnotation = useAppSelector(selectRequired(target));
    const unusedAnnotation = useAppSelector(selectUnused(target));

    if (
        !boundaryAnnotation &&
        !constantAnnotation &&
        !enumAnnotation &&
        !optionalAnnotation &&
        !renameAnnotation &&
        !requiredAnnotation &&
        !unusedAnnotation
    ) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <Stack maxW="fit-content">
            {boundaryAnnotation && (
                <Annotation
                    type="boundary"
                    name={(boundaryToString(boundaryAnnotation))}
                    onEdit={() => dispatch(showBoundaryAnnotationForm(target))}
                    onDelete={() => dispatch(removeBoundary(target))}
                />
            )}
            {constantAnnotation && (
                <Annotation
                    type="constant"
                    name={`${constantAnnotation.defaultType.toString()}_${constantAnnotation.defaultValue.toString()}`}
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
            {optionalAnnotation && (
                <Annotation
                    type="optional"
                    name={`${optionalAnnotation.defaultType.toString()}_${optionalAnnotation.defaultValue.toString()}`}
                    onEdit={() => dispatch(showOptionalAnnotationForm(target))}
                    onDelete={() => dispatch(removeOptional(target))}
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
                leftIcon={<FaWrench />}
                flexGrow={1}
                justifyContent="flex-start"
                disabled={!onEdit}
                onClick={onEdit}
            >
                @{type}
                {name && (
                    <Text as="span" fontWeight="normal" justifySelf="flex-end">
                        : {name}
                    </Text>
                )}
            </Button>
            <IconButton
                icon={<FaTrash />}
                aria-label="Delete annotation"
                colorScheme="red"
                onClick={onDelete}
            />
        </ButtonGroup>
    );
};

export default AnnotationView;
