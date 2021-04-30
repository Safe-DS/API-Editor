import React from 'react'
import ModuleNode from "./ModuleNode";


const Tree = ({inputPackage}) => {
    return (
        <div>
            <ul>
                {inputPackage.modules.map(module => (
                    <ModuleNode key={module.name} inputModule={module}/>
                ))}
            </ul>
        </div>
    )
}

export default Tree;