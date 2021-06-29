import {Col, Container, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import EnumPair from "../../../model/EnumPair";
import EnumPairRow from "./EnumPairRow";

type EnumFormProps = {
    listOfEnumPairs: EnumPair[];
}

export default function EnumHandle({listOfEnumPairs,
                                   }: EnumFormProps): JSX.Element {   //EnumForm name eigentlich



    const [length, setLength] = useState(listOfEnumPairs.length);//damit update passiert


    const deleteInstanceByKey = ( key: string) => {
        console.log("delete "+ key);
        listOfEnumPairs.forEach(function(value, index, array){
            if(value.key == key){
                console.log("delete at index "+ index);
                console.log("key: "+array[index].key + "val: "+array[index].value);
                listOfEnumPairs.splice(index, 1);
            }
        });
        refreshItemsList();
    };


    let listItems = listOfEnumPairs.map((pair, index) =>
        <EnumPairRow pair={pair} key={String(index)} deleteFunction={deleteInstanceByKey}/>);

    const refreshItemsList = () =>{
        listItems = listOfEnumPairs.map((pair, index) =>
            <EnumPairRow pair={pair} key={String(index)}  deleteFunction={deleteInstanceByKey}/>);
        setLength(listOfEnumPairs.length);
    };


    const listWhenEmptyItemsList = () =>{
        console.log("Empty List");
        if(listOfEnumPairs.length < 1){
            listOfEnumPairs.push(new EnumPair("",""));
        }
        refreshItemsList();
    };

    const addEnumInstance = () =>{
        console.log("add");
        listOfEnumPairs.push(new EnumPair("",""));
        refreshItemsList();
    };



    return(
        <Container>
            <Row className="enum-pair-row">
                <Col xs={5} className="no-left-padding">String/Value:</Col>
                <Col xs={5} className="right">Name of enum Instance:</Col>
                <Col xs={2} className="enum-item-icon"><FontAwesomeIcon icon={faPlus} onClick={addEnumInstance}/></Col>
            </Row>


            {listWhenEmptyItemsList}
            {length > 0 && listItems /**/}
            {/*check if list is empty - if empty add one Data"row" to enum - else just show the enum data rows*/}
        </Container>
    );
}
/*<Row className="enum-pair-row">
                <Col xs={5} className="no-left-padding">
                    <Form.Control
                        type="text"
                        placeholder="Parameter String/Value"//{currentName}
                        value={enumValue}
                        onChange={onInputEnumValue}
                        isInvalid={!enumValueValid}
                    />
                </Col>
                <Col xs={5} className="no-right-padding">
                    <Form.Control
                        type="text"
                        placeholder="Enum Name"//{currentName}
                        value={enumInstanceName}
                        onChange={onInputEnumInstanceName}
                        isInvalid={!enumInstanceNameValid}
                    />
                </Col>
                <Col xs={2} className="delete-enum-item-icon"><FontAwesomeIcon icon={faTrash}/></Col>
            </Row>*/
