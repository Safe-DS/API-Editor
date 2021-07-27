import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { isEmptyList } from '../../util/listOperations'

interface ClassViewItemProps {
    title: string
    inputElements: string[] | string
}

export default function SectionListViewItem(props: ClassViewItemProps): JSX.Element {
    if (typeof props.inputElements === 'string') {
        props.inputElements = [props.inputElements]
    }

    return (
        <Stack spacing={4}>
            <Heading as="h4" size="md">
                {props.title}
            </Heading>
            {!isEmptyList(props.inputElements) ? (
                props.inputElements.map((listElement, index) => (
                    <Box paddingLeft={4} key={index}>
                        {listElement}
                    </Box>
                ))
            ) : (
                <Text paddingLeft={4} color="gray.500">
                    There are no {props.title.toLowerCase()}.
                </Text>
            )}
        </Stack>
    )
}
