import { Heading } from '@chakra-ui/react'
import React from 'react'
import PythonFunction from '../../model/python/PythonFunction'
import { isEmptyList } from '../../util/listOperations'
import DocumentationText from './DocumentationText'
import ParameterNode from './ParameterNode'

interface FunctionViewProps {
    pythonFunction: PythonFunction
}

export default function FunctionView(props: FunctionViewProps): JSX.Element {
    return (
        <div>
            <Heading as="h2" size="lg">
                {props.pythonFunction.name}
            </Heading>
            {props.pythonFunction.description ? (
                <DocumentationText inputText={props.pythonFunction.description} />
            ) : (
                <p className="pl-1rem text-muted">There is no documentation for this function.</p>
            )}
            <Heading as="h3">Parameters</Heading>
            <div className="pl-1rem">
                {!isEmptyList(props.pythonFunction.parameters) ? (
                    props.pythonFunction.parameters.map((parameters) => (
                        <ParameterNode key={parameters.name} pythonParameter={parameters} isTitle={false} />
                    ))
                ) : (
                    <span className="text-muted pl-1rem">There are no parameters.</span>
                )}
            </div>
        </div>
    )
}
