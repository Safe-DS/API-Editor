import React from "react";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/python/PythonParameter";
import TitleValueViewPair from "./TitleValueViewPair";

interface ParameterViewProps {
    pythonParameter: PythonParameter,
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {

    return (
        <>
            <h1>{props.pythonParameter.name}</h1>
            <DocumentationText inputText={props.pythonParameter.description}/>
            {props.pythonParameter.hasDefault && <TitleValueViewPair title="Default value" value={props.pythonParameter.defaultValue}/>}
            {props.pythonParameter.type &&
            <><h2>Type</h2><span className="pl-2rem">{props.pythonParameter.type}</span></>
            }
        </>
    );
}
