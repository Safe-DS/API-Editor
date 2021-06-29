import {Col, Form, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import EnumPair from "../../../model/EnumPair";
import {enumValueValidation, nameValidation} from "../../../util/validation";

type EnumPairRowProps = {
    pair: EnumPair,
    //listOfEnumPairs: EnumPair[],
    //setListLength: Setter<number>
    deleteFunction(key: string): any,

}

export default function EnumPairRow(props: EnumPairRowProps): JSX.Element {

    const [enumValueValid, setEnumValueValid] = useState(true);
    const [enumValue, setEnumValue] = useState("");
    const [enumInstanceNameValid, setEnumInstanceNameValid] = useState(true);
    const [enumInstanceName, setEnumInstanceName] = useState("");




    /*const resetData = () => {
        setEnumValue("");
        setEnumValueValid(true);

        setEnumInstanceName("");
        setEnumInstanceNameValid(true);
    };*/


    const onInputEnumInstanceName = (event: React.ChangeEvent<HTMLInputElement>) => {//Key
        const valid = nameValidation(event.target.value);
        setEnumInstanceName(event.target.value);
        setEnumInstanceNameValid(valid);
        props.pair.key = event.target.value;
        props.pair.validKey = valid;
    };

    const onInputEnumValue = (event: React.ChangeEvent<HTMLInputElement>) => {//Value
        const valid = enumValueValidation(event.target.value);
        props.pair.value = event.target.value;
        props.pair.validValue = valid;

        setEnumValue(event.target.value);
        setEnumValueValid(valid);
    };




    return (
        <Row className="enum-pair-row">
            <Col xs={5} className="no-left-padding">
                <Form.Control type="text"
                              value={enumInstanceName}
                              onChange={onInputEnumInstanceName}
                              isInvalid={!enumInstanceNameValid}>

                </Form.Control>
            </Col>
            <Col xs={5} className="no-right-padding">
                <Form.Control type="text"
                              value={enumValue}
                              onChange={onInputEnumValue}
                              isInvalid={!enumValueValid}>

                </Form.Control>
            </Col>
            <Col xs={2} className="enum-item-icon">
                <FontAwesomeIcon
                    className="indicator visibility-indicator"
                    icon={faTrash}
                    onClick={() => props.deleteFunction(enumInstanceName)}
                />
            </Col>
        </Row>
    );
}

