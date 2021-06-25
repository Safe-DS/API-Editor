import React, {SyntheticEvent, useState} from "react";
import {Button, ButtonGroup, Form, FormControl, FormLabel, Row, Col, InputGroup} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench, faTrash } from '@fortawesome/free-solid-svg-icons'

const AnnotationList = () => {

    const [rename, setRename] = useState("neuerName");

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
};

export default AnnotationList;