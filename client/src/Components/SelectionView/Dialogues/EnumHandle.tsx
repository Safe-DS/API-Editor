import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import EnumPair from '../../../model/EnumPair'
import { Setter } from '../../../util/types'
import EnumPairRow from './EnumPairRow'

type EnumFormProps = {
    listOfEnumPairs: EnumPair[]
    setListOfEnumPairs: Setter<EnumPair[]>
}

export default function EnumHandle({ listOfEnumPairs, setListOfEnumPairs }: EnumFormProps): JSX.Element {
    //EnumForm name eigentlich

    const deleteInstanceByIndex = (index: number) => {
        const tmpCopy = [...listOfEnumPairs]
        tmpCopy.splice(index, 1)
        setListOfEnumPairs(tmpCopy)
    }

    const addEnumInstance = () => {
        const tmpCopy = [...listOfEnumPairs]
        tmpCopy.push(new EnumPair('', ''))
        setListOfEnumPairs(tmpCopy)
    }

    return (
        <Container>
            <Row className="enum-pair-row">
                <Col xs={5} className="no-left-padding">
                    String value:
                </Col>
                <Col xs={5} className="right">
                    Instance name:
                </Col>
                <Col xs={2} className="enum-item-icon">
                    <Button size="sm" variant="success" onClick={addEnumInstance}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </Col>
            </Row>
            <div>
                {listOfEnumPairs.map((pair, index) => (
                    <EnumPairRow
                        pair={pair}
                        key={pair.key + '' + index}
                        deleteFunction={() => deleteInstanceByIndex(index)}
                    />
                ))}
            </div>
        </Container>
    )
}
