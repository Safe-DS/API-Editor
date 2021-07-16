import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonParameter from "../../model/python/PythonParameter";
import {Nullable, Setter} from "../../util/types";
import RenameDialog from "../Dialog/RenameDialog";
import "./SelectionView.css";
import RenameAnnotationView from "./RenameAnnotationView";
import classNames from "classnames";

interface ParameterNodeProps {
    pythonParameter: PythonParameter,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
    isTitle: boolean,
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

    const dropdownClassnames = classNames({
        "parameter-is-title" : props.isTitle,
    });

    return (
        <div>
            <div className="parameter-header">
                {props.isTitle ? <h1 className="parameter-name">{props.pythonParameter.name}</h1> : <h4 className="parameter-name">{props.pythonParameter.name}</h4>}
                <div className={dropdownClassnames}>
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
                !props.pythonParameter.description &&
                <p className="pl-1rem text-muted">There is no documentation for this parameter.</p>
            }
        </div>
    );
}
