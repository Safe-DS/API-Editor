import { Code, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import 'katex/dist/katex.min.css'
import React, { useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { CodeComponent, NormalComponent } from 'react-markdown/src/ast-to-react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

interface DocumentationTextProps {
    inputText: string
}

const CustomText: NormalComponent = ({ className, children, ...props }) => {
    return (
        <Text className={className} {...props}>
            {children}
        </Text>
    )
}

const CustomCode: CodeComponent = ({ className, children, ...props }) => {
    return (
        <Code className={className} {...props}>
            {children}
        </Code>
    )
}

const components = {
    p: CustomText,
    code: CustomCode,
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
            <HStack
                alignItems="flex-start"
                cursor={!hasMultipleLines || readMore ? undefined : 'pointer'}
                onClick={
                    !hasMultipleLines || readMore
                        ? undefined
                        : (event) => {
                              event.stopPropagation()
                              setReadMore(!readMore)
                          }
                }
            >
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

                <Stack spacing={4}>
                    <ReactMarkdown
                        components={components}
                        rehypePlugins={[rehypeKatex]}
                        remarkPlugins={[remarkGfm, remarkMath]}
                    >
                        {readMore || !hasMultipleLines ? preprocessedText : shortenedText + ' **[Read More...]**'}
                    </ReactMarkdown>
                </Stack>
            </HStack>
        </Flex>
    )
}
