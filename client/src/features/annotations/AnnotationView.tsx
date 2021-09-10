import { Button, ButtonGroup, IconButton, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { FaTrash, FaWrench } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    removeEnum,
    removeRenaming,
    removeUnused,
    removeRequired,
    selectEnum,
    selectRenaming,
    selectUnused,
    selectRequired,
    showEnumAnnotationForm,
    showRenameAnnotationForm,
} from './annotationSlice';

interface AnnotationViewProps {
    target: string;
}

const AnnotationView: React.FC<AnnotationViewProps> = function ({ target }) {
    const dispatch = useAppDispatch();

    const renameAnnotation = useAppSelector(selectRenaming(target));
    const unusedAnnotation = useAppSelector(selectUnused(target));
    const enumAnnotation = useAppSelector(selectEnum(target));
    const requiredAnnotation = useAppSelector(selectRequired(target));

    if (
        !renameAnnotation &&
        !unusedAnnotation &&
        !enumAnnotation &&
        !requiredAnnotation
    ) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <Stack maxW="fit-content">
            {renameAnnotation && (
                <Annotation
                    type="rename"
                    name={renameAnnotation.newName}
                    onEdit={() => dispatch(showRenameAnnotationForm(target))}
                    onDelete={() => dispatch(removeRenaming(target))}
                />
            )}
            {unusedAnnotation && (
                <Annotation
                    type="unused"
                    onDelete={() => dispatch(removeUnused(target))}
                />
            )}
            {requiredAnnotation && (
                <Annotation
                    type="required"
                    onDelete={() => dispatch(removeRequired(target))}
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
