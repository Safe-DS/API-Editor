import React, {useState} from 'react'
import ModuleNode from "./ModuleNode";

const Tree = ({inputPackage}) => {

    const [selection, setSelection ] = useState();

    return (
        <div>
            <ul className="tree">
                {inputPackage.modules.map(module => (
                    <ModuleNode key={module.name}
                                inputModule={module}
                                selection={selection}
                                setSelection={setSelection}/>
                ))}
            </ul>
        </div>
    );
}

export default Tree;