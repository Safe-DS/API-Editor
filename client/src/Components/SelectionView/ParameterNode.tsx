import { Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import AnnotationDropdown from '../../features/annotations/menus/AnnotationDropdown'
import AnnotationView from '../../features/annotations/views/AnnotationView'
import PythonParameter from '../../model/python/PythonParameter'
import DocumentationText from './DocumentationText'

interface ParameterNodeProps {
    pythonParameter: PythonParameter
    isTitle: boolean
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const id = props.pythonParameter.pathAsString()

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

            <AnnotationView target={id} />

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
