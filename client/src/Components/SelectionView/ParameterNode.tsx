import { Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
    EnumAnnotation,
    removeEnum,
    removeRenaming,
    selectEnum,
    selectRenaming,
    showEnumAnnotationForm,
    showRenameAnnotationForm,
    upsertEnum,
    upsertRenaming,
} from '../../features/annotations/annotationSlice'
import AnnotationDropdown from '../../features/annotations/menus/AnnotationDropdown'
import PythonParameter from '../../model/python/PythonParameter'
import { Optional } from '../../util/types'
import AnnotationView from './AnnotationView'
import DocumentationText from './DocumentationText'
import ParameterNodeCSS from './ParameterNode.module.css'

interface ParameterNodeProps {
    pythonParameter: PythonParameter
    isTitle: boolean
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const dispatch = useAppDispatch()
    const id = props.pythonParameter.pathAsString()

    const newName = useAppSelector(selectRenaming(id))?.newName
    const setNewName = (newName: Optional<string>) => {
        if (newName === undefined || newName === null || newName === props.pythonParameter.name) {
            dispatch(removeRenaming(id))
        } else {
            dispatch(
                upsertRenaming({
                    target: id,
                    newName,
                }),
            )
        }
    }

    const newEnumDefinition = useAppSelector(selectEnum(id))
    const setNewEnumDefinition = (newEnum: Optional<EnumAnnotation>) => {
        if (newEnum === undefined || newEnum === null) {
            dispatch(removeEnum(id))
        } else {
            dispatch(upsertEnum(newEnum))
        }
    }

    const openRenameDialog = () => dispatch(showRenameAnnotationForm(id))
    const openEnumDialog = () => dispatch(showEnumAnnotationForm(id))

    return (
        <Stack spacing={4}>
            <HStack>
                {props.isTitle ? (
                    <Heading as="h3" size="lg">
                        {props.pythonParameter.name}
                    </Heading>
                ) : (
                    <Heading as="h5" size="sm">
                        {props.pythonParameter.name}
                    </Heading>
                )}
                <AnnotationDropdown target={id} showRename showEnum />
            </HStack>

            {(newName || newEnumDefinition) && (
                <Stack className={ParameterNodeCSS.annotationList}>
                    {newName !== null && newName !== undefined && (
                        <AnnotationView
                            type="rename"
                            name={newName}
                            onEdit={openRenameDialog}
                            onDelete={() => setNewName(null)}
                        />
                    )}
                    {newEnumDefinition?.enumName !== null && newEnumDefinition?.enumName !== undefined && (
                        <AnnotationView
                            type="enum"
                            name={newEnumDefinition?.enumName as string}
                            onEdit={openEnumDialog}
                            onDelete={() => setNewEnumDefinition(null)}
                        />
                    )}
                </Stack>
            )}

            {props.pythonParameter.description ? (
                <DocumentationText inputText={props.pythonParameter?.description} />
            ) : (
                <Text paddingLeft={4} className="text-muted">
                    There is no documentation for this parameter.
                </Text>
            )}
        </Stack>
    )
}
