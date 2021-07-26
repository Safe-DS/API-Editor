import { Box, Button, Flex, Heading, Icon, Menu, MenuButton, MenuItem, MenuList, Stack } from '@chakra-ui/react'
import classNames from 'classnames'
import React from 'react'
import { FaChevronDown } from 'react-icons/fa'
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

    const dropdownClassnames = classNames({
        [ParameterNodeCSS.parameterIsTitle]: props.isTitle,
    })

    return (
        <Box>
            <Flex justifyContent="flex-start" fontWeight="bold">
                {props.isTitle ? (
                    <Heading as="h1" marginRight={1}>
                        {props.pythonParameter.name}
                    </Heading>
                ) : (
                    <Heading as="h5" marginRight={1}>
                        {props.pythonParameter.name}
                    </Heading>
                )}
                <Box className={dropdownClassnames}>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            + @Annotation
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={openRenameDialog}>@Rename</MenuItem>
                            <MenuItem onClick={openEnumDialog}>@Enum</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            </Flex>

            {(newName || newEnumDefinition) && (
                <>
                    <Heading>Annotations</Heading>
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
                </>
            )}

            {props.pythonParameter.description ? (
                <DocumentationText inputText={props.pythonParameter?.description} />
            ) : (
                <p className="pl-1rem text-muted">There is no documentation for this parameter.</p>
            )}
        </Box>
    )
}
