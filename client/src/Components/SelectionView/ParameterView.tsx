import { Heading, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import PythonParameter from '../../model/python/PythonParameter'
import ParameterNode from './ParameterNode'
import TitleValueViewPair from './TitleValueViewPair'

interface ParameterViewProps {
    pythonParameter: PythonParameter
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {
    return (
        <Stack spacing={8}>
            <ParameterNode isTitle={true} pythonParameter={props.pythonParameter} />
            {props.pythonParameter.hasDefault && (
                <TitleValueViewPair title="Default value" value={props.pythonParameter.defaultValue} />
            )}
            {props.pythonParameter.type && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Type
                    </Heading>
                    <Text paddingLeft={4}>{props.pythonParameter.type}</Text>
                </Stack>
            )}
        </Stack>
    )
}
