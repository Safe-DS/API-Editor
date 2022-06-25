import {
    Code,
    Flex,
    HStack,
    IconButton,
    Link as ChakraLink,
    Stack,
    Text as ChakraText,
    UnorderedList,
} from '@chakra-ui/react';
import 'katex/dist/katex.min.css';
import React, { ClassAttributes, FunctionComponent, HTMLAttributes, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import {
    CodeComponent,
    ComponentPropsWithoutRef,
    ComponentType,
    ReactMarkdownProps,
    UnorderedListComponent,
} from 'react-markdown/lib/ast-to-react';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { useAppSelector } from '../../../app/hooks';
import { selectExpandDocumentationByDefault } from '../../ui/uiSlice';
import { Link as RouterLink } from 'react-router-dom';
import { PythonDeclaration } from '../model/PythonDeclaration';
import { PythonPackage } from '../model/PythonPackage';

interface DocumentationTextProps {
    declaration: PythonDeclaration;
    inputText: string;
}

type ParagraphComponent = FunctionComponent<
    ClassAttributes<HTMLParagraphElement> & HTMLAttributes<HTMLParagraphElement> & ReactMarkdownProps
>;

type LinkComponent = ComponentType<ComponentPropsWithoutRef<'a'> & ReactMarkdownProps>;

const CustomLink: LinkComponent = function ({ className, children, href }) {
    return (
        <ChakraLink as={RouterLink} to={href ?? '#'} className={className} textDecoration="underline">
            {children}
        </ChakraLink>
    );
};

const CustomCode: CodeComponent = function ({ className, children }) {
    return <Code className={className}>{children}</Code>;
};

const CustomText: ParagraphComponent = function ({ className, children }) {
    return <ChakraText className={className}>{children}</ChakraText>;
};

const CustomUnorderedList: UnorderedListComponent = function ({ className, children }) {
    return <UnorderedList className={className}>{children}</UnorderedList>;
};

const components = {
    a: CustomLink,
    code: CustomCode,
    p: CustomText,
    ul: CustomUnorderedList,
};

export const DocumentationText: React.FC<DocumentationTextProps> = function ({ declaration, inputText = '' }) {
    const expandDocumentationByDefault = useAppSelector(selectExpandDocumentationByDefault);

    const preprocessedText = inputText
        // replace single new-lines by spaces
        .replaceAll(/(?<!\n)\n(?!\n)/gu, ' ')
        // replace inline math elements
        .replaceAll(/:math:`([^`]*)`/gu, '$$1$')
        // replace block math elements
        .replaceAll(/\.\. math::\s*(\S.*)\n\n/gu, '$$\n$1\n$$\n\n')
        // replace relative links to classes
        .replaceAll(/:class:`(\w*)`/gu, (_match, name) => resolveRelativeLink(declaration, name))
        // replace relative links to functions
        .replaceAll(/:func:`(\w*)`/gu, (_match, name) => resolveRelativeLink(declaration, name))
        // replace absolute links to modules
        .replaceAll(/:mod:`([\w.]*)`/gu, (_match, qualifiedName) => resolveAbsoluteLink(declaration, qualifiedName, 1))
        // replace absolute links to classes
        .replaceAll(/:class:`~?([\w.]*)`/gu, (_match, qualifiedName) =>
            resolveAbsoluteLink(declaration, qualifiedName, 2),
        )
        // replace absolute links to classes
        .replaceAll(/:func:`~?([\w.]*)`/gu, (_match, qualifiedName) =>
            resolveAbsoluteLink(declaration, qualifiedName, 2),
        );

    const shortenedText = preprocessedText.split('\n\n')[0];
    const hasMultipleLines = shortenedText !== preprocessedText;
    const [readMore, setReadMore] = useState(expandDocumentationByDefault);

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

const resolveRelativeLink = function (currentDeclaration: PythonDeclaration, linkedDeclarationName: string): string {
    const parent = currentDeclaration.parent();
    if (!parent) {
        return linkedDeclarationName;
    }

    const sibling = parent.children().find((it) => it.name === linkedDeclarationName);
    if (!sibling) {
        return linkedDeclarationName;
    }

    return `[${currentDeclaration.preferredQualifiedName()}](${sibling.id})`;
};

const resolveAbsoluteLink = function (
    currentDeclaration: PythonDeclaration,
    linkedDeclarationQualifiedName: string,
    segmentCount: number,
): string {
    let segments = linkedDeclarationQualifiedName.split('.');
    if (segments.length < segmentCount) {
        return linkedDeclarationQualifiedName;
    }

    segments = [
        segments.slice(0, segments.length - segmentCount + 1).join('.'),
        ...segments.slice(segments.length - segmentCount + 1),
    ];

    let current = currentDeclaration.root();
    if (!(current instanceof PythonPackage)) {
        return linkedDeclarationQualifiedName;
    }

    for (const segment of segments) {
        const next = current.children().find((it) => it.name === segment);
        if (!next) {
            return linkedDeclarationQualifiedName;
        }

        current = next;
    }

    return `[${current.preferredQualifiedName()}](${current.id})`;
};
