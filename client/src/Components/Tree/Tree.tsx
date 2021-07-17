import React from 'react';
import PythonPackage from "../../model/python/PythonPackage";
import {isEmptyList} from "../../util/listOperations";
import ModuleNode from "./ModuleNode";
import TreeCSS from "./Tree.module.css";

interface TreeProps {
    pythonPackage: PythonPackage
}

export default function Tree(props: TreeProps): JSX.Element {
    return (
        <div className={TreeCSS.tree}>
            {[...props.pythonPackage.modules]
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(module => !isEmptyList(module.classes) || !isEmptyList(module.functions))
                .map(module => (
                    <ModuleNode key={module.name}
                                pythonModule={module}/>
                ))
            }
        </div>
    );
}
