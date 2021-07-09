import {Button, Col, Container, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import EnumPair from "../../../model/EnumPair";
import EnumPairRow from "./EnumPairRow";
import {Setter} from "../../../util/types";

type EnumFormProps = {
    listOfEnumPairs: EnumPair[];
    setListOfEnumPairs: Setter<EnumPair[]>;
}

export default function EnumHandle({listOfEnumPairs, setListOfEnumPairs
                                   }: EnumFormProps): JSX.Element {   //EnumForm name eigentlich


    const deleteInstanceByIndex = ( index: number) => {
        const tmpCopy = [...listOfEnumPairs];
        tmpCopy.splice(index,1 );
        setListOfEnumPairs(tmpCopy);
    };


    const addEnumInstance = () =>{
        console.log("add");
        const tmpCopy = [...listOfEnumPairs];
        tmpCopy.unshift(new EnumPair("",""));
        setListOfEnumPairs(tmpCopy);
    };

    return(
        <Container>
            <Row className="enum-pair-row">
                <Col xs={5} className="no-left-padding">String/Value:</Col>
                <Col xs={5} className="right">Name of enum Instance:</Col>
                <Col xs={2} className="enum-item-icon">
                    <Button size="sm" variant="success" onClick={addEnumInstance}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </Col>
            </Row>
            <div>
                {listOfEnumPairs.map((pair, index) =>
                    <EnumPairRow pair={pair} key={pair.key + "" + index} deleteFunction={() => deleteInstanceByIndex(index)}/>)}
            </div>
        </Container>
    );
}
