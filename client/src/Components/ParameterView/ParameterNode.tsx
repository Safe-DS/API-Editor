import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import {Dropdown} from "react-bootstrap";
import RenameDialog from "./RenameDialog";

type ParameterProps = { inputParameter: PythonParameter }

const ParameterNode = ({inputParameter}: ParameterProps) => {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");
    const handleRenameDialog = () => setRenameDialog(true);

    const handleSelect = (e: any) => {
        if (e === "rename") {
            if(!renameName) {
                setRenameName(inputParameter?.name);
            }
            handleRenameDialog();
        }
    };

    return (
        <div className="parametersList">
            <div className="parameter-header">
                <h4 className={"parameter-name"}>{inputParameter?.name}</h4>
                <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                        + @Annotation
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onSelect={handleSelect} eventKey="rename">@Rename</Dropdown.Item>
                        <Dropdown.Item onSelect={handleSelect} eventKey="enum">@Enum</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <RenameDialog handleState={renameDialog} setDialogState={setRenameDialog} setRenameName={setRenameName}
                          currentRename={renameName}/>

            {
                hasDescription &&
                <DocumentationText inputText={inputParameter?.description}/>
            }
            {
                !hasDescription &&
                <p className="pl-1-5rem">No Documentation available</p>
            }

        </div>
    );
};

export default ParameterNode;

