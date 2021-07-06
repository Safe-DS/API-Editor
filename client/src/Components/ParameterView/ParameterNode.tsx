import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonParameter from "../../model/python/PythonParameter";
import {Nullable, Setter} from "../../util/types";
import RenameDialog from "../Dialog/RenameDialog";
import DocumentationText from "./DocumentationText";
import "./ParameterView.css";
import RenameAnnotationView from "./RenameAnnotationView";

interface ParameterNodeProps {
    pythonParameter: PythonParameter
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const [showRenameDialog, setShowRenameDialog] = useState(false);

    const newName = props.annotationStore.getRenamingFor(props.pythonParameter);
    const setNewName = (newName: Nullable<string>) => {
        props.setAnnotationStore(
            props.annotationStore.setRenamingFor(props.pythonParameter, newName)
        );
    };

    const openRenameDialog = () => setShowRenameDialog(true);
    const handleEnumSelect = () => console.log("TODO");

    return (
        <div className="parameter-list">
            <div className="parameter-header">
                <h4 className="parameter-name">{props.pythonParameter.name}</h4>
                <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                        + @Annotation
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onSelect={openRenameDialog}>@Rename</Dropdown.Item>
                        <Dropdown.Item onSelect={handleEnumSelect}>@Enum</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <RenameAnnotationView
                newName={newName}
                setNewName={setNewName}
                onRenameEdit={openRenameDialog}
            />

            {/*This additional check cause the dialog to be thrown away after closing it, resetting its state*/}
            {showRenameDialog && <RenameDialog
                isVisible={showRenameDialog}
                setIsVisible={setShowRenameDialog}
                oldName={props.pythonParameter.name}
                newName={newName}
                setNewName={setNewName}
            />}

            {
                props.pythonParameter.description &&
                <DocumentationText inputText={props.pythonParameter?.description}/>
            }
            {
                !props.pythonParameter.description &&
                <p className="pl-3-5rem text-muted">There is no documentation for this parameter.</p>
            }
        </div>
    );
}
