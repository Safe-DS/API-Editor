import React from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import { Dropdown } from "react-bootstrap";

type ParameterProps = {inputParameter: PythonParameter}

const ParameterNode = ({inputParameter}: ParameterProps) => {
    return (
        <div className="parametersList">
            <span className="parameter-header">
                <h4 className={"parameter-name"}>{inputParameter?.name}</h4>
                <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                        + @Annotation
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="rename">@Rename</Dropdown.Item>
                        <Dropdown.Item eventKey="enum">@Enum</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </span>
            <DocumentationText inputText={inputParameter?.docstring}/>
        </div>
    );
};

export default ParameterNode;

