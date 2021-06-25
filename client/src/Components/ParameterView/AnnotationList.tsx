import React from "react";
import {Button, ButtonGroup, Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';

type AnnotationListProps = {
    renameName: string,
    setCurrentName: Setter<string>
}

export default function AnnotationList  (props: AnnotationListProps): JSX.Element {

    const deleteRename = () => {
        props.setCurrentName("");
    }

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
                        <Button size="sm"><FontAwesomeIcon icon={ faWrench } /></Button>
                        <Button size="sm"><FontAwesomeIcon icon={ faTrash }  onClick={deleteRename} /></Button>
                    </ButtonGroup>
                </Col>
            </Form.Group>
        </div>);
    }
    return <></>;
}
