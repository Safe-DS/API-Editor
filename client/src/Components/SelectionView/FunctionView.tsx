import React from "react";
import PythonFunction from "../../model/python/PythonFunction";
import DocumentationText from "./DocumentationText";
import {isEmptyList} from "../../util/listOperations";
import ParameterNode from "./ParameterNode";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {Setter} from "../../util/types";
import {useLocation} from "react-router";
import PythonPackage from "../../model/python/PythonPackage";

interface FunctionViewProps {
    pythonPackage: PythonPackage,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
}

export default function FunctionView(props: FunctionViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <div>
            {declaration instanceof PythonFunction &&
            <>
                <h1>{declaration.name}</h1>
                <DocumentationText inputText={declaration.description}/>
                <h2 className={"function-title"}>Parameters</h2>
                {
                    !isEmptyList(declaration.parameters) ?
                        declaration.parameters.map(parameters => (
                            <ParameterNode
                                key={parameters.name}
                                pythonParameter={parameters}
                                annotationStore={props.annotationStore}
                                setAnnotationStore={props.setAnnotationStore}
                                isTitle={false}
                            />
                        )) :
                        <span className={"text-muted pl-1rem"}>There are no parameters.</span>
                }
            </>
            }
        </div>
    );
}
