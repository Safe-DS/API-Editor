import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import EnumDialog from "./Dialogues/EnumDialog";
import RenameAnnotationView from "./RenameAnnotationView";
import {Nullable, Setter} from "../../util/types";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonParameter from "../../model/python/PythonParameter";
import RenameDialog from "../Dialog/RenameDialog";
import "./SelectionView.css";
import classNames from "classnames";
import PythonEnum from "../../model/python/PythonEnum";
import EnumAnnotationView from "./EnumAnnotationView";

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
        "parameter-is-title" : props.isTitle,
    });

    return (
        <div>
            <div className="parameter-header">
                {props.isTitle ? <h1 className="parameter-name">{props.pythonParameter.name}</h1> : <h4 className="parameter-name">{props.pythonParameter.name}</h4>}
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

            {newName &&
                <h4>Annotations</h4>
            }
            <RenameAnnotationView
                newName={newName}
                setNewName={setNewName}
                onRenameEdit={openRenameDialog}
            />
            <EnumAnnotationView
                enumDefinition={newEnumDefinition}
                setEnumDefinition={setNewEnumDefinition}
                onEnumEdit={openEnumDialog}
            />

            {/*This additional check cause the dialog to be thrown away after closing it, resetting its state*/}
            {showRenameDialog && <RenameDialog
                isVisible={showRenameDialog}
                setIsVisible={setShowRenameDialog}
                oldName={props.pythonParameter.name}
                newName={newName}
                setNewName={setNewName}
            />}

            {showEnumDialog && <EnumDialog
                dialogState={showEnumDialog} setDialogState={setShowEnumDialog}
                                           enumDefinition={newEnumDefinition} setEnumDefinition={setNewEnumDefinition}/>
            }
            {
                !props.pythonParameter.description &&
                <p className="pl-1rem text-muted">There is no documentation for this parameter.</p>

            }
        </div>
    );
}
