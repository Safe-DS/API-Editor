import React from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";

type ParameterProps = {inputParameter: PythonParameter}

const ParameterNode = ({inputParameter}: ParameterProps) => {

    const hasDescription = !!inputParameter.docstring;

    return (
        <div className="parametersList">

            <span className="parameter-name">
                <h4>{inputParameter?.name}</h4>
            </span>
            {
                hasDescription &&
                <DocumentationText inputText={inputParameter?.docstring}/>
            }
            {
                !hasDescription &&
                <p>No Documentation available</p>
            }

        </div>
    );
};

export default ParameterNode;

