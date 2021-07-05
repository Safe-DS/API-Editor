import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import RenameAnnotation from "../../model/annotation/RenameAnnotation";
import PythonParameter from "../../model/python/PythonParameter";
import {Nullable} from "../../util/types";
import RenameDialog from "../Dialog/RenameDialog";
import DocumentationText from "./DocumentationText";
import "./ParameterView.css";
import RenameAnnotationView from "./RenameAnnotationView";

interface ParameterNodeProps {
    inputParameter: PythonParameter
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [renameAnnotation, setRenameAnnotation] = useState<Nullable<RenameAnnotation>>(null);

    const openRenameDialog = () => setShowRenameDialog(true);
    const handleEnumSelect = () => console.log("TODO");

    return (
        <div className="parameter-list">
            <div className="parameter-header">
                <h4 className="parameter-name">{props.inputParameter.name}</h4>
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
                renameAnnotation={renameAnnotation}
                setRenameAnnotation={setRenameAnnotation}
                onRenameEdit={openRenameDialog}
            />

            {/*This additional check cause the dialog to be thrown away after closing it, resetting its state*/}
            {showRenameDialog && <RenameDialog
                isVisible={showRenameDialog}
                setIsVisible={setShowRenameDialog}
                originalName={props.inputParameter.name}
                renameAnnotation={renameAnnotation}
                setRenameAnnotation={setRenameAnnotation}
            />}

            {
                props.inputParameter.description &&
                <DocumentationText inputText={props.inputParameter?.description}/>
            }
            {
                !props.inputParameter.description &&
                <p className="pl-3-5rem text-muted">There is no documentation for this parameter.</p>
            }
        </div>
    );
}
