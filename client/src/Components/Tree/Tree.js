import React from 'react'
import ModuleNode from "./ModuleNode";


const Tree = ({inputPackage, setParameters}) => {
    return (
        <div>
            <ul>
                {inputPackage.modules.map(module => (
                    <ModuleNode key={module.name} inputModule={module} setParameters={setParameters}/>
                ))}
            </ul>
        </div>
    )
}

export default Tree;