import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import PythonParameter from "../../model/PythonParameter";
import DocumentationText from "./DocumentationText";
import "./ParameterView.css";
import RenameDialog from "./RenameDialog";
import RenameAnnotation from "./RenameAnnotation";

interface ParameterNodeProps {
    inputParameter: PythonParameter
}

export default function ParameterNode({inputParameter}: ParameterNodeProps): JSX.Element {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");
    const [renameNameAnnotation, setRenameNameAnnotation] = useState("");
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

    const handleRenameSubmit = (name: string) => {
        setRenameNameAnnotation(name);
    };

    return (
        <div className="parameter-list">
            <div className="parameter-header">
                <h4 className="parameter-name">{inputParameter?.name}</h4>
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
            <RenameAnnotation renameName={renameNameAnnotation} setRenameName={setRenameNameAnnotation}
                              onRenameEdit={handleRenameSelect}/>

            <RenameDialog dialogState={renameDialog} setDialogState={setRenameDialog} setCurrentName={setRenameName}
                          currentName={renameName} onSubmit={handleRenameSubmit}/>
            {
                hasDescription &&
                <DocumentationText inputText={inputParameter?.description}/>
            }
            {
                !hasDescription &&
                <p className="pl-3-5rem text-muted">There is no documentation for this parameter.</p>
            }
        </div>
    );
}
