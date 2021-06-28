import React from "react";
import {Button, ButtonGroup, Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';

type RenameProps = {
    renameName: string;
    setRenameName: Setter<string>;
    onRenameEdit: () => void;
}

export default function AnnotationList  (props: RenameProps): JSX.Element {

    const deleteRename = () => {
        props.setRenameName("");
    };

    if (props.renameName != "")
    {
        return (<div>
            <h5>Annotations</h5>
            <Form.Group as={Row} controlId="formGridEmail">
                <Form.Label column xs="auto">@rename</Form.Label>
                <Col xs="auto">
                    <Button className="rounded-pill" size="sm">{props.renameName}</Button>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm" onClick={props.onRenameEdit}><FontAwesomeIcon icon={ faWrench } /></Button>
                        <Button size="sm" onClick={deleteRename}><FontAwesomeIcon icon={ faTrash } /></Button>
                    </ButtonGroup>
                </Col>
            </Form.Group>
        </div>);
    }
    return <></>;
}
