import React from "react";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonFunction from "../../model/python/PythonFunction";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import DocumentationText from "./DocumentationText";
import ParameterNode from "./ParameterNode";
import {useLocation} from "react-router";
import PythonPackage from "../../model/python/PythonPackage";

interface ParameterViewProps {
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
    pythonPackage: PythonPackage
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <div className="parameter-view">
            {declaration instanceof PythonFunction &&
            <>
                <h1>{declaration.name}</h1>
                <DocumentationText inputText={declaration.description}/>
                <h2 className={"parameter-title"}>Parameters</h2>
                {
                    !isEmptyList(declaration.parameters) ?
                        declaration.parameters.map(parameters => (
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
