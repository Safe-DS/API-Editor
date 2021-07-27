import { Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import AnnotationDropdown from '../../features/annotations/menus/AnnotationDropdown'
import AnnotationView from '../../features/annotations/views/AnnotationView'
import PythonClass from '../../model/python/PythonClass'
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
                {props.pythonClass.description ? (
                    <DocumentationText inputText={props.pythonClass.description} />
                ) : (
                    <Text paddingLeft={4} className="text-muted">
                        There is no documentation for this class.
                    </Text>
                )}
            </Stack>
            <SectionListViewItem title={'Superclasses'} inputElements={props.pythonClass.superclasses} />
            <SectionListViewItem title={'Decorators'} inputElements={props.pythonClass.decorators} />
        </Stack>
    )
}
