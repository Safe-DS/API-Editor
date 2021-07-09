import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import {Dropdown} from "react-bootstrap";
import EnumDialog from "./Dialogues/EnumDialog";
import EnumPair from "../../model/EnumPair";
import RenameAnnotationView from "./RenameAnnotationView";
import {Nullable, Setter} from "../../util/types";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonParameter from "../../model/python/PythonParameter";
import RenameDialog from "../Dialog/RenameDialog";

type ParameterProps = { inputParameter: PythonParameter }

interface ParameterNodeProps {
    pythonParameter: PythonParameter
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>
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
    const [enumDialog, setEnumDialog] = useState(false);
    const [enumName, setEnumName] = useState("");
    const pair1 = new EnumPair("HELLO_1", "world1");
    const pair2 = new EnumPair("HELLO_2", "world2");
    const pair3 = new EnumPair("HELLO_3", "world3");

    const [enumList, setEnumList] = useState<EnumPair[]>([pair1, pair2, pair3]);


    const openRenameDialog = () => setShowRenameDialog(true);
    const openEnumDialog = () => {
        setShowEnumDialog(true);
    };


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
                        <Dropdown.Item onSelect={openEnumDialog}>@Enum</Dropdown.Item>
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

            <EnumDialog dialogState={showEnumDialog} setDialogState={setShowEnumDialog} setCurrentName={setEnumName}
                        currentName={enumName} enumList={enumList}/>
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
