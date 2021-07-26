import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Setter } from '../../../../util/types'
import { isValidEnumInstanceName } from '../../../../util/validation'
import { EnumPair } from '../../annotationSlice'
import EnumDialogCSS from './EnumDialog.module.css'

type EnumPairRowProps = {
    pair: EnumPair
    deleteFunction(key: string): void
    shouldValidate: boolean
    setShouldValidate: Setter<boolean>
}

export default function EnumPairRow(props: EnumPairRowProps): JSX.Element {
    const [instanceName, setInstanceName] = useState(props.pair.instanceName)
    const [stringValue, setStringValue] = useState(props.pair.stringValue)

    const onInputStringValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        //Key
        props.pair.stringValue = event.target.value // TODO broken assignment
        setStringValue(event.target.value)
    }

    const onInputInstanceName = (event: React.ChangeEvent<HTMLInputElement>) => {
        //Value
        props.pair.instanceName = event.target.value // TODO broken assignment
        setInstanceName(event.target.value)
    }

    return (
        <Row className={EnumDialogCSS.enumPairRow}>
            <Col xs={5} className="no-left-padding">
                <Form.Control
                    type="text"
                    value={stringValue}
                    onChange={onInputStringValue}
                    isInvalid={!props.pair.stringValue && props.shouldValidate}
                />
            </Col>
            <Col xs={5} className="no-right-padding">
                <Form.Control
                    type="text"
                    value={instanceName}
                    onChange={onInputInstanceName}
                    isInvalid={
                        (!isValidEnumInstanceName(props.pair.instanceName) && !!props.pair.instanceName) ||
                        (!props.pair.instanceName && props.shouldValidate)
                    }
                />
                <Form.Control.Feedback type="invalid">
                    Valid Python enum instance names must start with an uppercase letter or underscore followed by
                    uppercase letters, numbers and underscores.
                </Form.Control.Feedback>
            </Col>

            <Col xs={2} className={EnumDialogCSS.enumItemIcon}>
                <Button size="sm" variant="danger" onClick={() => props.deleteFunction(stringValue)}>
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </Col>
        </Row>
    )
}
