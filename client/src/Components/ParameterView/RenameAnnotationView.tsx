import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from "react";
import {Button, ButtonGroup, Card, Col, Row} from "react-bootstrap";
import {Nullable, Setter} from "../../util/types";

interface RenameAnnotationViewProps {
    newName: Nullable<string>,
    setNewName: Setter<Nullable<string>>,
    onRenameEdit: () => void,
}

const RenameAnnotationView: React.FC<RenameAnnotationViewProps> = (props) => {
    const deleteRenameAnnotation = () => props.setNewName(null);

    if (props.newName !== null) {
        return (<div>
            <h5>Annotations</h5>
            <Card>
                <Card.Body>
                <Row>
                    <Col>
                        <code>{`@rename: ${props.newName}`}</code>
                    </Col>
                    <Col>
                        <ButtonGroup>
                            <Button size="sm" onClick={props.onRenameEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                            <Button size="sm" onClick={deleteRenameAnnotation}><FontAwesomeIcon icon={faTrash}/></Button>
                        </ButtonGroup>
                    </Col>
                </Row>
                </Card.Body>
            </Card>
        </div>);
    }
    return <></>;
};

export default RenameAnnotationView;
