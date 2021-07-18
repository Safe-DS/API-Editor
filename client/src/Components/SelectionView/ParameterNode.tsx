import classNames from "classnames";
import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonEnum from "../../model/python/PythonEnum";
import PythonParameter from "../../model/python/PythonParameter";
import {Nullable, Setter} from "../../util/types";
import RenameDialog from "../Dialog/RenameDialog";
import EnumDialog from "./Dialogues/EnumDialog";
import DocumentationText from "./DocumentationText";
import AnnotationView from "./AnnotationView";
import "./SelectionView.css";

interface ParameterNodeProps {
    pythonParameter: PythonParameter,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
    isTitle: boolean,
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showEnumDialog, setShowEnumDialog] = useState(false);

    const newName = props.annotationStore.getRenamingFor(props.pythonParameter);
    const setNewName = (newName: Nullable<string>) => {
        props.setAnnotationStore(
            props.annotationStore.setRenamingFor(props.pythonParameter, newName)
        );
    };

    const newEnumDefinition = props.annotationStore.getEnumFor(props.pythonParameter);
    const setNewEnumDefinition = (newEnum: Nullable<PythonEnum>) => { //ToDo warum  nullable param
        props.setAnnotationStore(
            props.annotationStore.setEnumFor(props.pythonParameter, newEnum)
        );
    };

    const openRenameDialog = () => setShowRenameDialog(true);
    const openEnumDialog = () => setShowEnumDialog(true);


    const dropdownClassnames = classNames({
        "parameter-is-title": props.isTitle,
    });

    return (
        <div>
            <div className="parameter-header">
                {props.isTitle ? <h1 className="parameter-name">{props.pythonParameter.name}</h1> :
                    <h4 className="parameter-name">{props.pythonParameter.name}</h4>}
                <div className={dropdownClassnames}>
                    <Dropdown>
                        <Dropdown.Toggle size="sm" variant="primary">
                            + @Annotation
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onSelect={openRenameDialog}>@Rename</Dropdown.Item>
                            <Dropdown.Item onSelect={openEnumDialog}>@Enum</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <AnnotationView
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

            <EnumDialog dialogState={showEnumDialog} setDialogState={setShowEnumDialog}
                        enumDefinition={newEnumDefinition} setEnumDefinition={setNewEnumDefinition}/>

            {props.pythonParameter.description ?
                <DocumentationText inputText={props.pythonParameter?.description}/>
                : <p className="pl-1rem text-muted">There is no documentation for this parameter.</p>
            }
        </div>
    );
}
