import React from "react";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/python/PythonParameter";
import TitleValueViewPair from "./TitleValueViewPair";
import {useLocation} from "react-router";
import PythonPackage from "../../model/python/PythonPackage";

interface ParameterViewProps {
    pythonPackage: PythonPackage,
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <>
            {declaration instanceof PythonParameter &&
            <>
                <h1>{declaration.name}</h1>
                <DocumentationText inputText={declaration.description}/>
                {declaration.hasDefault &&
                <TitleValueViewPair title="Default value" value={declaration.defaultValue}/>}
                {declaration.type &&
                <><h2>Type</h2><span className="pl-2rem">{declaration.type}</span></>
                }
            </>}
        </>
    );
}
