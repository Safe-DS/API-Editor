import React from 'react';
import PythonPackage from "../../model/python/PythonPackage";
import ModuleNode from "./ModuleNode";
import TreeViewCSS from "./TreeView.module.css";

interface TreeViewProps {
    pythonPackage: PythonPackage,
    filter: string
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={TreeViewCSS.treeView}>
            {[...props.pythonPackage.modules]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(module => (
                    <ModuleNode key={module.name}
                                pythonModule={module}/>
                ))
            }
        </div>
    );
}
