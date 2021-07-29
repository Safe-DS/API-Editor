import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import AnnotationDropdown from '../../annotations/AnnotationDropdown'
import AnnotationView from '../../annotations/AnnotationView'
import PythonClass from '../model/PythonClass'
import DocumentationText from './DocumentationText'
import SectionListViewItem from './SectionListViewItem'

interface ClassViewProps {
    pythonClass: PythonClass
}

export default function ClassView(props: ClassViewProps): JSX.Element {
    const id = props.pythonClass.pathAsString()

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack>
                    <Heading as="h3" size="lg">
                        {props.pythonClass.name}
                    </Heading>
                    <AnnotationDropdown target={id} showRename showUnused />
                </HStack>

                <AnnotationView target={id} />

                <Box paddingLeft={4}>
                    {props.pythonClass.description ? (
                        <DocumentationText inputText={props.pythonClass.description} />
                    ) : (
                        <Text color="gray.500">There is no documentation for this class.</Text>
                    )}
                </Box>
            </Stack>
            <SectionListViewItem title="Superclasses" inputElements={props.pythonClass.superclasses} />
            <SectionListViewItem title="Decorators" inputElements={props.pythonClass.decorators} />
        </Stack>
    )
}
