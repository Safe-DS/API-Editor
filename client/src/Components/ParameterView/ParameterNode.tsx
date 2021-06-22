import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import {Dropdown} from "react-bootstrap";
import RenameDialog from "./RenameDialog";

type ParameterProps = { inputParameter: PythonParameter }

export default function ParameterNode({inputParameter}: ParameterProps): JSX.Element {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");
    const handleRenameDialog = () => setRenameDialog(true);

    const handleRenameSelect = () => {
        if (!renameName) {
            setRenameName(inputParameter.name);
        }
        handleRenameDialog();
    };

    const handleEnumSelect = () => {
        console.log("TODO");
    }

    return (
        <div className="parametersList">
            <div className="parameter-header">
                <h4 className={"parameter-name"}>{inputParameter?.name}</h4>
                <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                        + @Annotation
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onSelect={handleRenameSelect} eventKey="rename">@Rename</Dropdown.Item>
                        <Dropdown.Item onSelect={handleEnumSelect} eventKey="enum">@Enum</Dropdown.Item>
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
}
