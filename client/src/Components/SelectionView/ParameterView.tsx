import React from "react";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/python/PythonParameter";
import TitleValueViewPair from "./TitleValueViewPair";
import {useLocation} from "react-router";
import PythonPackage from "../../model/python/PythonPackage";
import ParameterNode from "./ParameterNode";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {Setter} from "../../util/types";

interface ParameterViewProps {
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
    pythonPackage: PythonPackage,
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <>
            {declaration instanceof PythonParameter &&
            <>
                <ParameterNode isTitle={true} pythonParameter={declaration} setAnnotationStore={props.setAnnotationStore}
                               annotationStore={props.annotationStore}/>
                <DocumentationText inputText={declaration.description}/>
                {declaration.hasDefault &&
                <TitleValueViewPair title="Default value" value={declaration.defaultValue}/>}
                {declaration.type &&
                <><h2>Type</h2><span className="pl-1rem">{declaration.type}</span></>
                }
            </>}
        </>
    );
}
