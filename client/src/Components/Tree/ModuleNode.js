import React from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule}) => {
    return (
        <li key={inputModule.name}>
            <div>
                {inputModule.name}
            </div>
            <ul>
                {inputModule.classes.map(moduleClass => (
                    <ClassNode inputClass={moduleClass}/>
                ))}
            </ul>
            <ul>
                {inputModule.functions.map(moduleFunction => (
                    <FunctionNode inputFunction={moduleFunction}/>
                ))}
            </ul>
        </li>
    )
};

export default ModuleNode;