import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from "react";
import {Button, ButtonGroup, Col, Row} from "react-bootstrap";
import {Nullable, Setter} from "../../util/types";
import PythonEnum from "../../model/python/PythonEnum";

interface EnumAnnotationViewProps {
    enumDefinition: Nullable<PythonEnum>,
    setEnumDefinition: Setter<Nullable<PythonEnum>>,
    onEnumEdit: () => void,
}

const EnumAnnotationView: React.FC<EnumAnnotationViewProps> = (props) => {
    const deleteEnumAnnotation = () => props.setEnumDefinition(null);//.setNewName(null);

    if (props.enumDefinition !== null) {//.newName
        return (<div className={"annotation-list"}>
            <Row>
                <Col className="align-items-center" xs="auto">
                    <code>{`@enum: ${props.enumDefinition.enumName}`}</code>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm" onClick={props.onEnumEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                        <Button size="sm" onClick={deleteEnumAnnotation}><FontAwesomeIcon icon={faTrash}/></Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </div>);
    }
    return <></>;
};

export default EnumAnnotationView;
