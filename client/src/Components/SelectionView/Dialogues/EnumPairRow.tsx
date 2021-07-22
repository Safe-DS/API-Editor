import {Button, Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import EnumPair from "../../../model/EnumPair";
import {Setter} from "../../../util/types";

type EnumPairRowProps = {
    pair: EnumPair,
    deleteFunction(key: string): void,
    setOnSubmit: Setter<void>,
}

export default function EnumPairRow(props: EnumPairRowProps): JSX.Element {

    const [enumValueValid, setEnumValueValid] = useState(true);
    const [enumValue, setEnumValue] = useState(props.pair.value);
    const [enumKeyValid, setEnumKeyValid] = useState(true);
    const [enumKey, setEnumKey] = useState(props.pair.key);

    const onInputEnumKey = (event: React.ChangeEvent<HTMLInputElement>) => {//Key

        props.pair.key = event.target.value;
        const valid = props.pair.isValidKey();

        setEnumKey(event.target.value);
        setEnumKeyValid(valid);
    };

    const onInputEnumValue = (event: React.ChangeEvent<HTMLInputElement>) => {//Value
        props.pair.value = event.target.value;
        const valid = props.pair.isValidValue();

        setEnumValue(event.target.value);
        setEnumValueValid(valid);
    };

    const onSubmit = () => {
        const validValue = props.pair.isValidValue();
        const validKey = props.pair.isValidValue();

        if(props.pair.isValidValue()){
            setEnumValueValid(validValue);
        }
        if(props.pair.isValidKey()){
            setEnumKeyValid(validKey);
        }
    };

    props.setOnSubmit(onSubmit());

    return (
        <Row className="enum-pair-row">
            <Col xs={5} className="no-left-padding">
                <Form.Control type="text"
                              value={enumValue}
                              onChange={onInputEnumValue}
                              isInvalid={!enumValueValid}>

                </Form.Control>
            </Col>
            <Col xs={5} className="no-right-padding" title={"Only capital letters and numbers allowed"}>
                <Form.Control type="text"
                              value={enumKey}
                              onChange={onInputEnumKey}
                              isInvalid={!enumKeyValid}>
                </Form.Control>
            </Col>
            <Col xs={2} className="enum-item-icon">
                <Button size="sm" variant="danger" onClick={() => props.deleteFunction(enumKey)}>
                    <FontAwesomeIcon
                        icon={faTrash}
                    />
                </Button>
            </Col>
        </Row>
    );
}

