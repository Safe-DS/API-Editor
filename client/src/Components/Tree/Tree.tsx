import React from 'react';
import PythonDeclaration from "../../model/python/PythonDeclaration";
import PythonPackage from "../../model/python/PythonPackage";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import ModuleNode from "./ModuleNode";
import TreeCSS from "./Tree.module.css";

interface TreeProps {
    pythonPackage: PythonPackage
}

export default function Tree(props: TreeProps): JSX.Element {
    return (
        <div className={TreeCSS.tree}>
            {props.pythonPackage.modules
                .filter(module => !isEmptyList(module.classes) || !isEmptyList(module.functions))
                .map(module => (
                    <ModuleNode key={module.name}
                                pythonModule={module}/>
                ))}
        </div>
    );
}
