import {Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import EnumPair from "../../../model/EnumPair";

type EnumPairRowProps = {
    pair: EnumPair;
}

export default function EnumPairRow(props: EnumPairRowProps): JSX.Element {
    return (
        <Row className="enum-pair-row">
            <Col xs={5} className="no-left-padding">
                <Form.Control type="text" placeholder={props.pair.key}>

                </Form.Control>
            </Col>
            <Col xs={5} className="no-right-padding">
                <Form.Control type="text" placeholder={props.pair.value}>

                </Form.Control>
            </Col>
            <Col xs={2} className="delete-enum-item-icon">
                <FontAwesomeIcon
                    className="indicator visibility-indicator"
                    icon={faTrash}
                />
            </Col>
        </Row>
    );
}

