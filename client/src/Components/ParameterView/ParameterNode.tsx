import React, {useState} from "react";
import "./ParameterView.css";
import DocumentationText from "./DocumentationText";
import PythonParameter from "../../model/PythonParameter";
import {Dropdown} from "react-bootstrap";
import RenameDialog from "./RenameDialog";
import EnumDialog from "./EnumDialog";
import EnumPair from "../../model/EnumPair";

type ParameterProps = { inputParameter: PythonParameter }

export default function ParameterNode({inputParameter}: ParameterProps): JSX.Element {

    const hasDescription = !!inputParameter.description;

    const [renameDialog, setRenameDialog] = useState(false);
    const [renameName, setRenameName] = useState("");

    const [enumDialog, setEnumDialog] = useState(false);
    const [enumName, setEnumName] = useState("");
    const [enumList, setEnumList] = useState<EnumPair[]>([]);

    const openRenameDialog = () => setRenameDialog(true);
    const openEnumDialog = () => setEnumDialog(true);

    const handleRenameSelect = () => {
        if (!renameName) {
            setRenameName(inputParameter.name);
        }
        openRenameDialog();
    };

    const handleEnumSelect = () => {
        openEnumDialog();
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

            <EnumDialog dialogState={enumDialog} setDialogState={setEnumDialog} setCurrentName={setEnumName}
                          currentName={enumName} setEnumList={setEnumList}
                        enumList={enumList}/>

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
