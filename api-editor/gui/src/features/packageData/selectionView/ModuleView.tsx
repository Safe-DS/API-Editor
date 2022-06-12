import { Box, Code, Heading, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark as dark, atomOneLight as light } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import { groupBy, isEmptyList } from '../../../common/util/listOperations';
import { PythonModule } from '../model/PythonModule';
import { CodeComponent } from 'react-markdown/lib/ast-to-react';

// See https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
const CustomCode: CodeComponent = function ({
    node, // eslint-disable-line @typescript-eslint/no-unused-vars
    inline,
    className,
    children,
    ...props
}) {
    const style = useColorModeValue(light, dark);

    const match = /language-(\w+)/u.exec(className || '');
    return !inline && match ? (
        <SyntaxHighlighter
            // @ts-ignore
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

interface ModuleViewProps {
    pythonModule: PythonModule;
}

export const ModuleView: React.FC<ModuleViewProps> = function ({ pythonModule }) {
    useEffect(() => {
        SyntaxHighlighter.registerLanguage('python', python);
    }, []);

    const importString = pythonModule.imports.map((it) => it.toString()).join('\n');

    const longestModuleNameLength = Math.max(...pythonModule.fromImports.map((it) => it.module.length));

    const fromImportString = [...groupBy(pythonModule.fromImports, (it) => it.module)]
        .map(([module, fromImports]) => {
            const base = `from ${module} import`;
            const rest = fromImports.map((fromImport) => fromImport.toString().replace(`${base} `, '')).join(', ');

            return `from ${module.padEnd(longestModuleNameLength)} import ${rest}`;
        })
        .join('\n');

    return (
        <Stack spacing={8}>
            <Heading as="h3" size="lg">
                {pythonModule.name}
            </Heading>
            <Stack spacing={4}>
                <Heading as="h4" size="md">
                    Imports
                </Heading>
                {!isEmptyList(pythonModule.imports) && (
                    <Box paddingLeft={4}>
                        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                            {`~~~python\n${importString}\n~~~`}
                        </ReactMarkdown>
                    </Box>
                )}
                {!isEmptyList(pythonModule.fromImports) && (
                    <Box paddingLeft={4}>
                        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                            {`~~~python\n${fromImportString}\n~~~`}
                        </ReactMarkdown>
                    </Box>
                )}
                {isEmptyList(pythonModule.imports) && isEmptyList(pythonModule.fromImports) && (
                    <Text color="gray.500" paddingLeft={4}>
                        There are no imports.
                    </Text>
                )}
            </Stack>
        </Stack>
    );
};
