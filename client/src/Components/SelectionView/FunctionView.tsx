import { Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import AnnotationDropdown from '../../features/annotations/menus/AnnotationDropdown'
import AnnotationView from '../../features/annotations/views/AnnotationView'
import PythonFunction from '../../model/python/PythonFunction'
import { isEmptyList } from '../../util/listOperations'
import DocumentationText from './DocumentationText'
import ParameterNode from './ParameterNode'

interface FunctionViewProps {
    pythonFunction: PythonFunction
}

export default function FunctionView(props: FunctionViewProps): JSX.Element {
    const id = props.pythonFunction.pathAsString()

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack>
                    <Heading as="h3" size="lg">
                        {props.pythonFunction.name}
                    </Heading>
                    <AnnotationDropdown target={id} showRename showUnused />
                </HStack>
                <AnnotationView target={id} />

                {props.pythonFunction.description ? (
                    <DocumentationText inputText={props.pythonFunction.description} />
                ) : (
                    <Text paddingLeft={4} className="text-muted">
                        There is no documentation for this function.
                    </Text>
                )}
            </Stack>

            <Stack spacing={4}>
                <Heading as="h4" size="md">
                    Parameters
                </Heading>
                <Stack spacing={6} paddingLeft={4}>
                    {!isEmptyList(props.pythonFunction.parameters) ? (
                        props.pythonFunction.parameters.map((parameters) => (
                            <ParameterNode key={parameters.name} pythonParameter={parameters} isTitle={false} />
                        ))
                    ) : (
                        <Text paddingLeft={4} className="text-muted">
                            There are no parameters.
                        </Text>
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
}
