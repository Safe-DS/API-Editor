import React from "react";
import ReactMarkdown from "react-markdown";
import {CodeComponent} from "react-markdown/src/ast-to-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {materialLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from "remark-gfm";
import PythonModule from "../../model/python/PythonModule";
import {isEmptyList} from "../../util/listOperations";

interface ModuleViewProps {
    pythonModule: PythonModule,
}

// See https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const code: CodeComponent = ({node, inline, className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
        <SyntaxHighlighter style={materialLight} language={match[1]} PreTag="div"{...props} >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const components = {
    code
};

export default function ModuleView(props: ModuleViewProps): JSX.Element {
    const importString = props.pythonModule.imports
        .map((it) => it.toString())
        .join("\n");

    const fromImportString = props.pythonModule.fromImports
        .map((it) => it.toString())
        .join("\n");


    return (
        <>
            <h1>{props.pythonModule.name}</h1>
            <h2>Imports</h2>
            {!isEmptyList(props.pythonModule.imports) &&
            <div className="module-list">
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                    {`~~~python\n${importString}\n~~~`}
                </ReactMarkdown>
            </div>
            }
            {!isEmptyList(props.pythonModule.fromImports) &&
            <div className="module-list">
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                    {`~~~python\n${fromImportString}\n~~~`}
                </ReactMarkdown>
            </div>
            }
            {isEmptyList(props.pythonModule.imports) && isEmptyList(props.pythonModule.fromImports) &&
            <span className="text-muted" style={{paddingLeft: '1rem'}}>There are no imports.</span>
            }
        </>
    );
}
