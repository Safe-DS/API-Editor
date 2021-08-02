import {
    Heading,
    ListItem,
    Stack,
    Text,
    UnorderedList,
} from '@chakra-ui/react';
import React from 'react';
import { isEmptyList } from '../../../common/util/listOperations';

interface ClassViewItemProps {
    title: string;
    inputElements: string[] | string;
}

const SectionListViewItem: React.FC<ClassViewItemProps> = function ({
    title,
    inputElements,
}) {
    if (typeof inputElements === 'string') {
        // eslint-disable-next-line no-param-reassign
        inputElements = [inputElements];
    }

    return (
        <Stack spacing={4}>
            <Heading as="h4" size="md">
                {title}
            </Heading>
            {!isEmptyList(inputElements) ? (
                <UnorderedList paddingLeft={8}>
                    {inputElements.map((listElement, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <ListItem key={index}>{listElement}</ListItem>
                    ))}
                </UnorderedList>
            ) : (
                <Text paddingLeft={4} color="gray.500">
                    There are no {title.toLowerCase()}.
                </Text>
            )}
        </Stack>
    );
};

export default SectionListViewItem;
