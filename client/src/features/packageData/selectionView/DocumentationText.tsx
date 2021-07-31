import { Code, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import 'katex/dist/katex.min.css'
import React, { ReactNode, useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { CodeComponent, ReactMarkdownProps } from 'react-markdown/src/ast-to-react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

interface DocumentationTextProps {
    inputText: string
}

type ParagraphComponent = (
    props: React.ClassAttributes<HTMLParagraphElement> &
        React.HTMLAttributes<HTMLParagraphElement> &
        ReactMarkdownProps,
) => ReactNode

const CustomText: ParagraphComponent = ({ className, children }) => {
    return <Text className={className}>{children}</Text>
}

const CustomCode: CodeComponent = ({ className, children }) => {
    return <Code className={className}>{children}</Code>
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
        <Flex justifyContent="flex-start">
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
                        aria-label="Read more/less"
                        icon={readMore ? <FaChevronDown /> : <FaChevronRight />}
                        size="xs"
                        variant="outline"
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
