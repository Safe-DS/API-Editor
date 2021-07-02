import React from "react";
import {Button, ButtonGroup, Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {Setter} from "../../util/types";

interface RenameProps {
    renameName: string,
    setRenameName: Setter<string>,
    setCurrentName: Setter<string>
    setCurrentRenameValue: Setter<string>,
    onRenameEdit: () => void
}

export default function RenameAnnotation  ({setRenameName, renameName, setCurrentRenameValue, setCurrentName,
                                               onRenameEdit}: RenameProps): JSX.Element {

    const deleteRename = () => {
        setRenameName("");
        setCurrentName("");
        setCurrentRenameValue("");
    };

    if (renameName != "")
    {
        return (<div>
            <h5>Annotations</h5>
            <Row>
                <Col className="align-items-center" xs="auto">
                    <code>{`@rename: ${renameName}`}</code>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm" onClick={onRenameEdit}><FontAwesomeIcon icon={ faWrench } /></Button>
                        <Button size="sm" onClick={deleteRename}><FontAwesomeIcon icon={ faTrash } /></Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </div>);
    }
    return <></>;
}
