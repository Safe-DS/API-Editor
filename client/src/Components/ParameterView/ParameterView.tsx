import React from "react";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import PythonFunction from "../../model/python/PythonFunction";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import DocumentationText from "./DocumentationText";
import ParameterNode from "./ParameterNode";

interface ParameterViewProps {
    selection: PythonDeclaration,
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {
    return (
        <div className="parameter-view">
            {props.selection instanceof PythonFunction &&
            <>
                <h1>{props.selection.name}</h1>
                <DocumentationText inputText={props.selection.description}/>
                <h2 className={"parameter-title"}>Parameters</h2>
                {
                    !isEmptyList(props.selection.parameters) ?
                        props.selection.parameters.map(parameters => (
                            <ParameterNode
                                key={parameters.name}
                                pythonParameter={parameters}
                                annotationStore={props.annotationStore}
                                setAnnotationStore={props.setAnnotationStore}
                            />
                        )) :
                        <span className="text-muted" style={{paddingLeft: '1rem'}}>There are no parameters.</span>
                }
            </>
            }
        </div>
    );
}
