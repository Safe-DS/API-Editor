import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from "react";
import {Button, ButtonGroup, Col, Row} from "react-bootstrap";
import {Setter} from "../../util/types";

interface RenameAnnotationProps {
    renameName: string,
    setRenameName: Setter<string>,
    onRenameEdit: () => void
}

export default function RenameAnnotation(
    {
        setRenameName,
        renameName,
        onRenameEdit
    }: RenameAnnotationProps
): JSX.Element {

    const deleteRename = () => {
        setRenameName("");
    };

    if (renameName != "") {
        return (<div>
            <h5>Annotations</h5>
            <Row>
                <Col className="align-items-center" xs="auto">
                    <code>{`@rename: ${renameName}`}</code>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm" onClick={onRenameEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                        <Button size="sm" onClick={deleteRename}><FontAwesomeIcon icon={faTrash}/></Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </div>);
    }
    return <></>;
}
