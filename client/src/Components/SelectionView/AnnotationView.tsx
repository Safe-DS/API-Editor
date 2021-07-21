import {faTrash, faWrench} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from "react";
import {Button, ButtonGroup, Card} from "react-bootstrap";
import {Nullable, Setter} from "../../util/types";
import "./AnnotationView.css";

interface AnnotationViewProps {
    newName: Nullable<string>,
    setNewName: Setter<Nullable<string>>,
    onRenameEdit: () => void,
}

const AnnotationView: React.FC<AnnotationViewProps> = (props) => {
    const deleteRenameAnnotation = () => props.setNewName(null);

    if (props.newName !== null) {
        return (<div className={"annotation-list"}>
            <Card className="mb-2 w-fit-content" bg="light">
                <Card.Body>
                    <code className="pe-3">
                        {`@rename: ${props.newName}`}
                    </code>
                    <ButtonGroup>
                        <Button size="sm" onClick={props.onRenameEdit}><FontAwesomeIcon icon={faWrench}/></Button>
                        <Button size="sm" onClick={deleteRenameAnnotation}><FontAwesomeIcon icon={faTrash}/></Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
        </div>);
    }
    return <></>;
};

export default AnnotationView;
