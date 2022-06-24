import { Code, Flex, HStack, IconButton, Stack, Text as ChakraText, UnorderedList } from '@chakra-ui/react';
import 'katex/dist/katex.min.css';
import React, { ClassAttributes, FunctionComponent, HTMLAttributes, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { CodeComponent, ReactMarkdownProps, UnorderedListComponent } from 'react-markdown/lib/ast-to-react';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface DocumentationTextProps {
    inputText: string;
}

type ParagraphComponent = FunctionComponent<
    ClassAttributes<HTMLParagraphElement> & HTMLAttributes<HTMLParagraphElement> & ReactMarkdownProps
>;

const CustomText: ParagraphComponent = function ({ className, children }) {
    return <ChakraText className={className}>{children}</ChakraText>;
};

const CustomCode: CodeComponent = function ({ className, children }) {
    return <Code className={className}>{children}</Code>;
};

const CustomUnorderedList: UnorderedListComponent = function ({ className, children }) {
    return <UnorderedList className={className}>{children}</UnorderedList>;
};

const components = {
    p: CustomText,
    code: CustomCode,
    ul: CustomUnorderedList,
};

export const DocumentationText: React.FC<DocumentationTextProps> = function ({ inputText = '' }) {
    const preprocessedText = inputText
        // replace single new-lines by spaces
        .replaceAll(/(?<!\n)\n(?!\n)/gu, ' ')
        // replace inline math elements
        .replaceAll(/:math:`([^`]*)`/gu, '$$1$')
        // replace block math elements
        .replaceAll(/\.\. math::\s*(\S.*)\n\n/gu, '$$\n$1\n$$\n\n');

    const shortenedText = preprocessedText.split('\n\n')[0];
    const hasMultipleLines = shortenedText !== preprocessedText;
    const [readMore, setReadMore] = useState(false);

    return (
        <Flex justifyContent="flex-start">
            <HStack
                alignItems="flex-start"
                cursor={!hasMultipleLines || readMore ? undefined : 'pointer'}
                onClick={
                    !hasMultipleLines || readMore
                        ? undefined
                        : (event) => {
                              event.stopPropagation();
                              setReadMore(!readMore);
                          }
                }
            >
                {hasMultipleLines && (
                    <IconButton
                        aria-label="Read more/less"
                        icon={readMore ? <FaChevronDown /> : <FaChevronRight />}
                        size="xs"
                        variant="outline"
                        onClick={(event) => {
                            event.stopPropagation();
                            setReadMore(!readMore);
                        }}
                    />
                )}

                <Stack spacing={4}>
                    <ReactMarkdown
                        components={components}
                        rehypePlugins={[rehypeKatex]}
                        remarkPlugins={[remarkGfm, remarkMath]}
                    >
                        {readMore || !hasMultipleLines ? preprocessedText : `${shortenedText} **[Read More...]**`}
                    </ReactMarkdown>
                </Stack>
            </HStack>
        </Flex>
    );
};
