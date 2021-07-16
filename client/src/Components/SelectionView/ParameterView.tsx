import React from "react";
import PythonFunction from "../../model/python/PythonFunction";
import DocumentationText from "./DocumentationText";
import {isEmptyList} from "../../util/listOperations";
import ParameterNode from "./ParameterNode";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {Setter} from "../../util/types";

interface FunctionViewProps {
    pythonFunction: PythonFunction,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
}

export default function ParameterView(props: FunctionViewProps): JSX.Element {

    return (
        <>
            <h1>{props.pythonFunction.name}</h1>
            <DocumentationText inputText={props.pythonFunction.description}/>
            <h2 className={"function-title"}>Parameters</h2>
            {
                !isEmptyList(props.pythonFunction.parameters) ?
                    props.pythonFunction.parameters.map(parameters => (
                        <ParameterNode
                            key={parameters.name}
                            pythonParameter={parameters}
                            annotationStore={props.annotationStore}
                            setAnnotationStore={props.setAnnotationStore}
                        />
                    )) :
                    <span className={"text-muted, pl-2rem"}>There are no parameters.</span>
            }
        </>
    );
}
