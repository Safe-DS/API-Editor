import React from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import { Dropdown } from "react-bootstrap";
import AnnotationList from "./AnnotationList";

type ParameterProps = {inputParameter: PythonParameter}

const Parameter = ({inputParameter}: ParameterProps) => {

    const hasDescription = !!inputParameter.description;

    return (
        <div className="parameter-list">
            <div className="parameter-header">
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
            </div>
            <AnnotationList></AnnotationList>
            {
                hasDescription &&
                <DocumentationText inputText={inputParameter?.description}/>
            }
            {
                !hasDescription &&
                <p className="pl-1-5rem">There is no documentation for this parameter.</p>
            }

        </div>
    );
};

export default Parameter;

