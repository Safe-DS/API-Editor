import React from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule}) => {
    return (
        <li>
            <div>
                {inputModule.name}
            </div>
            <ul>
                {inputModule.classes.map(moduleClass => (
                    <ClassNode key={moduleClass.name} inputClass={moduleClass}/>
                ))}
            </ul>
            <ul>
                {inputModule.functions.map(moduleFunction => (
                    <FunctionNode key={moduleFunction.name} inputFunction={moduleFunction}/>
                ))}
            </ul>
        </li>
    )
};

export default ModuleNode;