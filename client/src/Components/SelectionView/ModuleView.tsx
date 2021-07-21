import React from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeComponent } from 'react-markdown/src/ast-to-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import PythonModule from '../../model/python/PythonModule'
import { groupBy, isEmptyList } from '../../util/listOperations'

interface ModuleViewProps {
    pythonModule: PythonModule
}

// See https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const code: CodeComponent = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
        <SyntaxHighlighter style={materialLight} language={match[1]} PreTag="div" {...props}>
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    )
}

const components = {
    code,
}

export default function ModuleView(props: ModuleViewProps): JSX.Element {
    const importString = [...props.pythonModule.imports]
        .sort((a, b) => a.module.localeCompare(b.module))
        .map((it) => it.toString())
        .join('\n')

    const longestModuleNameLength = Math.max(...props.pythonModule.fromImports.map((it) => it.module.length))

    const fromImportString = [...groupBy(props.pythonModule.fromImports, (it) => it.module)]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([module, fromImports]) => {
            const base = `from ${module} import`
            const rest = fromImports
                .sort((a, b) => a.declaration.localeCompare(b.declaration))
                .map((fromImport) => fromImport.toString().replace(`${base} `, ''))
                .join(', ')

            return `from ${module.padEnd(longestModuleNameLength)} import ${rest}`
        })
        .join('\n')

    return (
        <div>
            <h1>{props.pythonModule.name}</h1>
            <h2>Imports</h2>
            {!isEmptyList(props.pythonModule.imports) && (
                <div className="module-list">
                    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                        {`~~~python\n${importString}\n~~~`}
                    </ReactMarkdown>
                </div>
            )}
            {!isEmptyList(props.pythonModule.fromImports) && (
                <div className="module-list">
                    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                        {`~~~python\n${fromImportString}\n~~~`}
                    </ReactMarkdown>
                </div>
            )}
            {isEmptyList(props.pythonModule.imports) && isEmptyList(props.pythonModule.fromImports) && (
                <span className="text-muted" style={{ paddingLeft: '1rem' }}>
                    There are no imports.
                </span>
            )}
        </div>
    )
}
