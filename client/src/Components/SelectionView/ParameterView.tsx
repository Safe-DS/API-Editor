import React from "react";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/python/PythonParameter";
import TitleValueViewPair from "./TitleValueViewPair";

interface ParameterViewProps {
    pythonParameter: PythonParameter,
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {

    console.log(props.pythonParameter.typeInDocs);
    console.log(props.pythonParameter.type);

    return (
        <>
            <h1>{props.pythonParameter.name}</h1>
            <DocumentationText inputText={props.pythonParameter.description}/>
            {props.pythonParameter.hasDefault && <TitleValueViewPair title="Default value" value={props.pythonParameter.defaultValue}/>}
            <TitleValueViewPair title="Type" value={props.pythonParameter.type}/>
        </>
    );
}
