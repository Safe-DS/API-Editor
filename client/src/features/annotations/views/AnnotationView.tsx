import { Button, ButtonGroup, IconButton, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { FaTrash, FaWrench } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
    removeEnum,
    removeRenaming,
    selectEnum,
    selectRenaming,
    showEnumAnnotationForm,
    showRenameAnnotationForm,
} from '../annotationSlice'

interface AnnotationViewProps {
    target: string
}

const AnnotationView: React.FC<AnnotationViewProps> = ({ target }) => {
    const dispatch = useAppDispatch()

    const renameAnnotation = useAppSelector(selectRenaming(target))
    const enumAnnotation = useAppSelector(selectEnum(target))

    if (!renameAnnotation && !enumAnnotation) {
        return <></>
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
            {enumAnnotation && (
                <Annotation
                    type="enum"
                    name={enumAnnotation.enumName}
                    onEdit={() => dispatch(showEnumAnnotationForm(target))}
                    onDelete={() => dispatch(removeEnum(target))}
                />
            )}
        </Stack>
    )
}

interface AnnotationProps {
    type: string
    name: string
    onEdit?: () => void
    onDelete: () => void
}

const Annotation: React.FC<AnnotationProps> = (props) => {
    return (
        <ButtonGroup size="sm" variant="outline" isAttached>
            <Button
                leftIcon={<FaWrench />}
                flexGrow={1}
                justifyContent="flex-start"
                disabled={!props.onEdit}
                onClick={props.onEdit}
            >
                @{props.type}
                <Text as="span" fontWeight={'normal'} justifySelf="flex-end">
                    : {props.name}
                </Text>
            </Button>
            <IconButton
                icon={<FaTrash />}
                aria-label={'Delete annotation'}
                colorScheme="red"
                onClick={props.onDelete}
            />
        </ButtonGroup>
    )
}

export default AnnotationView
