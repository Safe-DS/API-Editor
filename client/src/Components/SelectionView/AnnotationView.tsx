import { faTrash, faWrench } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, ButtonGroup, Card } from 'react-bootstrap'
import { Optional } from '../../util/types'

interface AnnotationViewProps {
    type: string
    name: Optional<string>
    onEdit: () => void
    onDelete: () => void
}

const AnnotationView: React.FC<AnnotationViewProps> = (props) => {
    if (props.name === null || props.name === undefined) {
        return <></>
    }

    return (
        <Card className="mb-2 w-fit-content" bg="light">
            <Card.Body>
                <code className="pe-3">{`@${props.type}: ${props.name}`}</code>
                <ButtonGroup>
                    <Button size="sm" onClick={props.onEdit}>
                        <FontAwesomeIcon icon={faWrench} />
                    </Button>
                    <Button size="sm" onClick={props.onDelete}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default AnnotationView
