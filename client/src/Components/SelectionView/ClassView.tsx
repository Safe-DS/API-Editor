import { Heading, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import PythonClass from '../../model/python/PythonClass'
import DocumentationText from './DocumentationText'
import SectionListViewItem from './SectionListViewItem'

interface ClassViewProps {
    pythonClass: PythonClass
}

export default function ClassView(props: ClassViewProps): JSX.Element {
    return (
        <Stack spacing={8}>
            <Heading as="h3" size="lg">
                {props.pythonClass.name}
            </Heading>
            {props.pythonClass.description ? (
                <DocumentationText inputText={props.pythonClass.description} />
            ) : (
                <Text paddingLeft={4} className="text-muted">
                    There is no documentation for this class.
                </Text>
            )}
            <SectionListViewItem title={'Superclasses'} inputElements={props.pythonClass.superclasses} />
            <SectionListViewItem title={'Decorators'} inputElements={props.pythonClass.decorators} />
        </Stack>
    )
}
