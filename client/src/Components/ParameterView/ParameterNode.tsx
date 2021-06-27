import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import PythonParameter from "../../model/PythonParameter";
import DocumentationText from "./DocumentationText";
import "./ParameterView.css";
import RenameDialog from "./RenameDialog";

interface ParameterNodeProps {
    inputParameter: PythonParameter
}

export default function ParameterNode({inputParameter}: ParameterNodeProps): JSX.Element {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");
    const openRenameDialog = () => setRenameDialog(true);

    const handleRenameSelect = () => {
        if (!renameName) {
            setRenameName(inputParameter.name);
        }
        openRenameDialog();
    };

    const handleEnumSelect = () => {
        console.log("TODO");
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
                        <Dropdown.Item onSelect={handleRenameSelect}>@Rename</Dropdown.Item>
                        <Dropdown.Item onSelect={handleEnumSelect}>@Enum</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <RenameDialog dialogState={renameDialog} setDialogState={setRenameDialog} setCurrentName={setRenameName}
                          currentName={renameName}/>

            {
                hasDescription &&
                <DocumentationText inputText={inputParameter?.description}/>
            }
            {
                !hasDescription &&
                <p className="pl-3-5rem">No Documentation available</p>
            }
        </div>
    );
}
