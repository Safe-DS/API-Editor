import React from 'react'
import PythonFunction from '../../model/python/PythonFunction'
import { isEmptyList } from '../../util/listOperations'
import DocumentationText from './DocumentationText'
import FunctionViewCSS from './FunctionView.module.css'
import ParameterNode from './ParameterNode'

interface FunctionViewProps {
    pythonFunction: PythonFunction
}

export default function FunctionView(props: FunctionViewProps): JSX.Element {
    return (
        <div>
            <h1>{props.pythonFunction.name}</h1>
            {props.pythonFunction.description ? (
                <DocumentationText inputText={props.pythonFunction.description} />
            ) : (
                <p className="pl-1rem text-muted">There is no documentation for this function.</p>
            )}
            <h2 className={FunctionViewCSS.functionTitle}>Parameters</h2>
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
