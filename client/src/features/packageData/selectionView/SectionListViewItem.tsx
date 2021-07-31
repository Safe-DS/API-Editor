import { Heading, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import { isEmptyList } from '../../../common/util/listOperations';

interface ClassViewItemProps {
    title: string;
    inputElements: string[] | string;
}

export default function SectionListViewItem(props: ClassViewItemProps): JSX.Element {
    if (typeof props.inputElements === 'string') {
        props.inputElements = [props.inputElements];
    }

    return (
        <Stack spacing={4}>
            <Heading as="h4" size="md">
                {props.title}
            </Heading>
            {!isEmptyList(props.inputElements) ? (
                <UnorderedList paddingLeft={8}>
                    {props.inputElements.map((listElement, index) => (
                        <ListItem key={index}>{listElement}</ListItem>
                    ))}
                </UnorderedList>
            ) : (
                <Text paddingLeft={4} color="gray.500">
                    There are no {props.title.toLowerCase()}.
                </Text>
            )}
        </Stack>
    );
}
