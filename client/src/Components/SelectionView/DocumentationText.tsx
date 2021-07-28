import { Box, Flex, HStack, IconButton } from '@chakra-ui/react'
import 'katex/dist/katex.min.css'
import React, { useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

interface DocumentationTextProps {
    inputText: string
}

export default function DocumentationText({ inputText = '' }: DocumentationTextProps): JSX.Element {
    const preprocessedText = inputText
        .replaceAll(/(?<!\n)\n(?!\n)/g, ' ')
        .replaceAll(/:math:`([^`]*)`/g, '$$$1$$')
        .replaceAll(/\.\. math::\s*(\S.*)\n\n/g, '$$$\n$1\n$$$\n\n')

    const shortenedText = preprocessedText.split('\n\n')[0]
    const hasMultipleLines = shortenedText !== preprocessedText
    const [readMore, setReadMore] = useState(false)

    return (
        <Flex
            justifyContent="flex-start"
            onClick={() => {
                setReadMore(true)
            }}
        >
            <HStack alignItems="flex-start">
                {hasMultipleLines && (
                    <IconButton
                        aria-label="Expand"
                        as={readMore ? FaChevronDown : FaChevronRight}
                        size="xs"
                        padding={1}
                        variant="outline"
                        cursor="pointer"
                        onClick={(event) => {
                            event.stopPropagation()
                            setReadMore(!readMore)
                        }}
                    />
                )}
                <Box cursor={hasMultipleLines && !readMore ? 'pointer' : undefined}>
                    <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
                        {readMore || !hasMultipleLines ? preprocessedText : shortenedText + ' **[Read More...]**'}
                    </ReactMarkdown>
                </Box>
            </HStack>
        </Flex>
    )
}
