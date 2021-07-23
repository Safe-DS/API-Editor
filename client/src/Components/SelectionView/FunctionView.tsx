import React from 'react'
import AnnotationStore from '../../model/annotation/AnnotationStore'
import PythonFunction from '../../model/python/PythonFunction'
import { isEmptyList } from '../../util/listOperations'
import { Setter } from '../../util/types'
import DocumentationText from './DocumentationText'
import ParameterNode from './ParameterNode'
import FunctionViewCSS from './FunctionView.module.css'

interface FunctionViewProps {
    pythonFunction: PythonFunction
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>
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
                        <ParameterNode
                            key={parameters.name}
                            pythonParameter={parameters}
                            annotationStore={props.annotationStore}
                            setAnnotationStore={props.setAnnotationStore}
                            isTitle={false}
                        />
                    ))
                ) : (
                    <span className="text-muted pl-1rem">There are no parameters.</span>
                )}
            </div>
        </div>
    )
}
