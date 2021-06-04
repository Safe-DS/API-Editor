import React from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";

type ParameterProps = {inputParameter: PythonParameter}

const ParameterNode = ({inputParameter}: ParameterProps) => {
    return (
        <div className="parametersList">

            <span className="parameter-name">
                <h4>{inputParameter?.name}</h4>
            </span>

            <DocumentationText inputText={inputParameter?.docstring}/>
        </div>
    );
};

export default ParameterNode;

