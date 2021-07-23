import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import EnumPair from '../../../../model/EnumPair'
import { Setter } from '../../../../util/types'

type EnumPairRowProps = {
    pair: EnumPair
    deleteFunction(key: string): void
    shouldValidate: boolean
    setShouldValidate: Setter<boolean>
}

export default function EnumPairRow(props: EnumPairRowProps): JSX.Element {
    const [enumValue, setEnumValue] = useState(props.pair.value)
    const [enumKey, setEnumKey] = useState(props.pair.key)

    const onInputEnumKey = (event: React.ChangeEvent<HTMLInputElement>) => {
        //Key
        props.pair.key = event.target.value
        setEnumKey(event.target.value)
    }

    const onInputEnumValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        //Value
        props.pair.value = event.target.value
        setEnumValue(event.target.value)
    }

    return (
        <Row className="enum-pair-row">
            <Col xs={5} className="no-left-padding">
                <Form.Control
                    type="text"
                    value={enumValue}
                    onChange={onInputEnumValue}
                    isInvalid={
                        (!props.pair.isValidValue() && !!props.pair.value) ||
                        (!props.pair.value && props.shouldValidate)
                    }
                />
                <Form.Control.Feedback type="invalid">
                    Valid Python identifiers must start with a letter or underscore followed by letters, numbers and
                    underscores.
                </Form.Control.Feedback>
            </Col>
            <Col xs={5} className="no-right-padding">
                <Form.Control
                    type="text"
                    value={enumKey}
                    onChange={onInputEnumKey}
                    isInvalid={
                        (!props.pair.isValidKey() && !!props.pair.key) || (!props.pair.key && props.shouldValidate)
                    }
                />
                <Form.Control.Feedback type="invalid">
                    Valid Python Enum Keys must start with a capital letter followed by letters and numbers.
                </Form.Control.Feedback>
            </Col>
            <Col xs={2} className="enum-item-icon">
                <Button size="sm" variant="danger" onClick={() => props.deleteFunction(enumKey)}>
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </Col>
        </Row>
    )
}
