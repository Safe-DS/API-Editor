import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import {Dropdown} from "react-bootstrap";
import RenameDialog from "./RenameDialog";
import AnnotationList from "./AnnotationList";

type ParameterProps = { inputParameter: PythonParameter }

export default function Parameter({inputParameter}: ParameterProps): JSX.Element {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");
    const openRenameDialog = () => setRenameDialog(true)

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
        <div className="parameter-list">
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
            <AnnotationList renameName={renameName}/>

            <RenameDialog dialogState={renameDialog} setDialogState={setRenameDialog} setCurrentName={setRenameName}
                          currentName={renameName}/>
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
}