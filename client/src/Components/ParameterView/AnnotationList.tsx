import React, {useState} from "react";
import {Button, ButtonGroup, Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';

export default function AnnotationList  (): JSX.Element {

    const [rename] = useState("neuerName");

    return (<div>
        <h5>Annotations</h5>
            <Form.Group as={Row} controlId="formGridEmail">
                <Form.Label column xs="auto">@rename</Form.Label>
                <Col xs="auto">
                    <Button className="rounded-pill" size="sm">{ rename }</Button>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm"><FontAwesomeIcon icon={ faWrench } /></Button>
                        <Button size="sm"><FontAwesomeIcon icon={ faTrash } /></Button>
                    </ButtonGroup>
                </Col>
            </Form.Group>
    </div>);
}
