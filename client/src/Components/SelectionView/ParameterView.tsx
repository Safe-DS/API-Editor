import React from "react";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonParameter from "../../model/python/PythonParameter";
import {Setter} from "../../util/types";
import DocumentationText from "./DocumentationText";
import ParameterNode from "./ParameterNode";
import TitleValueViewPair from "./TitleValueViewPair";

interface ParameterViewProps {
    pythonParameter: PythonParameter,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {
    return (
        <div>
            <ParameterNode isTitle={true} pythonParameter={props.pythonParameter}
                           setAnnotationStore={props.setAnnotationStore}
                           annotationStore={props.annotationStore}/>
            <DocumentationText inputText={props.pythonParameter.description}/>
            {props.pythonParameter.hasDefault &&
            <TitleValueViewPair title="Default value" value={props.pythonParameter.defaultValue}/>}
            {props.pythonParameter.type &&
            <><h2>Type</h2><span className="pl-1rem">{props.pythonParameter.type}</span></>}
        </div>
    );
}
