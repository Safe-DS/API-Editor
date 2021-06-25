import React, {SyntheticEvent, useState} from "react";
import {Button, ButtonGroup, Form, FormControl, FormLabel, Row, Col, InputGroup} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench, faTrash } from '@fortawesome/free-solid-svg-icons'

const AnnotationList = () => {


    const [editable, setEditable] = useState(false);
    const [rename, setRename] = useState("neuerName");

    return (<div>
        <h5>Annotations</h5>
            <Form.Group as={Row} controlId="formGridEmail">
                <Form.Label column xs="auto">@rename</Form.Label>
                <Col xs="auto">
                    { editable ?
                        /* TODO: Gibt es hier einen passenden Event-Typen? */
                        <FormControl onKeyDown={ (event: any) => { if (event.key === "Enter") event.target.blur() } } onBlur={ () => setEditable(!editable) } onChange={ (event) => setRename(event.target.value) } value={ rename } size="sm" className="rounded-pill w-auto" role="textbox" contentEditable="true"></FormControl> :
                        <Button onClick={ () => setEditable(!editable) } className="rounded-pill" size="sm">{ rename }</Button>
                    }
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