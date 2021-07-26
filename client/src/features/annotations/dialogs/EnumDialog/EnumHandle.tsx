import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Setter } from '../../../../util/types'
import { EnumPair } from '../../annotationSlice'
import EnumPairRow from './EnumPairRow'
import EnumDialogCSS from './EnumDialog.module.css'

type EnumFormProps = {
    listOfEnumPairs: EnumPair[]
    setListOfEnumPairs: Setter<EnumPair[]>
    shouldValidate: boolean
    setShouldValidate: Setter<boolean>
}

export default function EnumHandle({
    listOfEnumPairs,
    setListOfEnumPairs,
    shouldValidate,
    setShouldValidate,
}: EnumFormProps): JSX.Element {
    const deleteInstanceByIndex = (index: number) => {
        if (listOfEnumPairs.length > 1) {
            const tmpCopy = [...listOfEnumPairs]
            tmpCopy.splice(index, 1)
            setListOfEnumPairs(tmpCopy)
            setShouldValidate(false)
        }
    }

    const addEnumInstance = () => {
        const tmpCopy = [...listOfEnumPairs]
        tmpCopy.push({
            instanceName: '',
            stringValue: '',
        })
        setListOfEnumPairs(tmpCopy)
        setShouldValidate(false)
    }

    return (
        <Container>
            <Row className={EnumDialogCSS.enumPairRow}>
                <Col xs={5} className="no-left-padding">
                    String value:
                </Col>
                <Col xs={5} className="right">
                    Instance name:
                </Col>
                <Col xs={2} className={EnumDialogCSS.enumItemIcon}>
                    <Button size="sm" variant="success" onClick={addEnumInstance}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </Col>
            </Row>
            <div>
                {listOfEnumPairs.map((pair, index) => (
                    <EnumPairRow
                        pair={pair}
                        key={pair.stringValue + '' + index}
                        deleteFunction={() => deleteInstanceByIndex(index)}
                        shouldValidate={shouldValidate}
                        setShouldValidate={setShouldValidate}
                    />
                ))}
            </div>
        </Container>
    )
}
