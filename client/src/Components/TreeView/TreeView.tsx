import React from 'react'
import PythonPackage from '../../model/python/PythonPackage'
import { isEmptyList } from '../../util/listOperations'
import ModuleNode from './ModuleNode'
import TreeViewCSS from './TreeView.module.css'

interface TreeViewProps {
    pythonPackage: PythonPackage
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={TreeViewCSS.treeView}>
            {[...props.pythonPackage.modules]
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter((module) => !isEmptyList(module.classes) || !isEmptyList(module.functions))
                .map((module) => (
                    <ModuleNode key={module.name} pythonModule={module} />
                ))}
        </div>
    )
}
