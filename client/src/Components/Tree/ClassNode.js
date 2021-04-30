import React from "react";

const ClassNode = ({inputClass}) => {
    return (
        <li key={inputClass.name}>
            <div>
                {inputClass.name}
            </div>
            <ul>
                {inputClass.superclasses.map(moduleClass => (
                    <ClassNode inputClass={moduleClass}/>
                ))}
            </ul>
        </li>
    )
};

export default ClassNode;