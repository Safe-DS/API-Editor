import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from "react";
import {Button, ButtonGroup, Card} from "react-bootstrap";
import {Nullable, Setter} from "../../util/types";
import "./AnnotationView.css";
import PythonEnum from "../../model/python/PythonEnum";

interface AnnotationViewProps {
    annotation: Nullable<string | PythonEnum>,
    setAnnotation: Setter<Nullable<string>> | Setter<Nullable<PythonEnum>>,
    onEdit: () => void,
}

const AnnotationView: React.FC<AnnotationViewProps> = (props) => {
    const deleteAnnotation = () => props.setAnnotation(null);

    if (props.annotation !== null) {
        return (
            <Card className="mb-2 w-fit-content" bg="light">
                <Card.Body>
                    <code className="pe-3">
                        {props.annotation instanceof PythonEnum ?
                            `@enum: ${props.annotation.enumName}` :
                            `@rename: ${props.annotation}`}
                    </code>
                    <ButtonGroup>
                        <Button size="sm" onClick={props.onEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                        <Button size="sm" onClick={deleteAnnotation}><FontAwesomeIcon icon={faTrash}/></Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
        );
    }
    return <></>;
};

export default AnnotationView;
