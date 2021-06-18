import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import {Dropdown} from "react-bootstrap";
import RenameDialog from "./RenameDialog";

type ParameterProps = {inputParameter: PythonParameter}

const ParameterNode = ({inputParameter}: ParameterProps) => {

    const hasDescription = !!inputParameter.docstring;

    const [renameDialog, setRenameDialog] = useState(false);
    const handleRenameDialog = () => setRenameDialog(true);

    //ToDo
    const handleSelect=(e: any )=>{
        if(e === "rename"){
            handleRenameDialog();
        }
    };

    return (
        <div className="parametersList">
            <span className="parameter-header">
                <h4 className={"parameter-name"}>{inputParameter?.name}</h4>
                <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                        + @Annotation
                    </Dropdown.Toggle>
                    <Dropdown.Menu >
                        <Dropdown.Item onSelect={handleSelect} eventKey="rename">@Rename</Dropdown.Item>
                        <Dropdown.Item onSelect={handleSelect} eventKey="enum">@Enum</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </span>

            <RenameDialog handleState={renameDialog} setDialogState={setRenameDialog}></RenameDialog>


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

