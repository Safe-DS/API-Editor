import {
    Box,
    Code,
    Heading,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeComponent } from 'react-markdown/src/ast-to-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import {
    atomOneDark as dark,
    atomOneLight as light,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import { groupBy, isEmptyList } from '../../../common/util/listOperations';
import PythonModule from '../model/PythonModule';

interface ModuleViewProps {
    pythonModule: PythonModule;
}

// See https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomCode: CodeComponent = ({
    node,
    inline,
    className,
    children,
    ...props
}) => {
    const style = useColorModeValue(light, dark);

    const match = /language-(\w+)/u.exec(className || '');
    return !inline && match ? (
        // @ts-ignore
        <SyntaxHighlighter
            style={style}
            language={match[1]}
            PreTag="div"
            {...props}
        >
            {String(children).replace(/\n$/u, '')}
        </SyntaxHighlighter>
    ) : (
        <Code className={className} {...props}>
            {children}
        </Code>
    );
};

const components = {
    code: CustomCode,
};

export default function ModuleView(props: ModuleViewProps): JSX.Element {
    useEffect(() => {
        SyntaxHighlighter.registerLanguage('python', python);
    }, []);

    const importString = props.pythonModule.imports
        .map((it) => it.toString())
        .join('\n');

    const longestModuleNameLength = Math.max(
        ...props.pythonModule.fromImports.map((it) => it.module.length),
    );

    const fromImportString = [
        ...groupBy(props.pythonModule.fromImports, (it) => it.module),
    ]
        .map(([module, fromImports]) => {
            const base = `from ${module} import`;
            const rest = fromImports
                .map((fromImport) =>
                    fromImport.toString().replace(`${base} `, ''),
                )
                .join(', ');

            return `from ${module.padEnd(
                longestModuleNameLength,
            )} import ${rest}`;
        })
        .join('\n');

    return (
        <Stack spacing={8}>
            <Heading as="h3" size="lg">
                {props.pythonModule.name}
            </Heading>
            <Stack spacing={4}>
                <Heading as="h4" size="md">
                    Imports
                </Heading>
                {!isEmptyList(props.pythonModule.imports) && (
                    <Box paddingLeft={4}>
                        <ReactMarkdown
                            components={components}
                            remarkPlugins={[remarkGfm]}
                        >
                            {`~~~python\n${importString}\n~~~`}
                        </ReactMarkdown>
                    </Box>
                )}
                {!isEmptyList(props.pythonModule.fromImports) && (
                    <Box paddingLeft={4}>
                        <ReactMarkdown
                            components={components}
                            remarkPlugins={[remarkGfm]}
                        >
                            {`~~~python\n${fromImportString}\n~~~`}
                        </ReactMarkdown>
                    </Box>
                )}
                {isEmptyList(props.pythonModule.imports) &&
                    isEmptyList(props.pythonModule.fromImports) && (
                        <Text color="gray.500" paddingLeft={4}>
                            There are no imports.
                        </Text>
                    )}
            </Stack>
        </Stack>
    );
}
