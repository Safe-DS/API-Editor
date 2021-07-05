import React from "react";
import {Button, ButtonGroup, Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import RenameAnnotation from "../../model/annotation/RenameAnnotation";
import {Nullable, Setter} from "../../util/types";

interface RenameAnnotationViewProps {
    renameAnnotation: Nullable<RenameAnnotation>,
    setRenameAnnotation: Setter<Nullable<RenameAnnotation>>,
    onRenameEdit: () => void,
}

const RenameAnnotationView: React.FC<RenameAnnotationViewProps> = (props) => {
    const deleteRenameAnnotation = () => props.setRenameAnnotation(null);

    if (props.renameAnnotation !== null) {
        return (<div>
            <h5>Annotations</h5>
            <Row>
                <Col className="align-items-center" xs="auto">
                    <code>{`@rename: ${props.renameAnnotation.newName}`}</code>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button size="sm" onClick={props.onRenameEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                        <Button size="sm" onClick={deleteRenameAnnotation}><FontAwesomeIcon icon={faTrash}/></Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </div>);
    }
    return <></>;
};

export default RenameAnnotationView;
