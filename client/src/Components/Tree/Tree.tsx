import React, {useState} from 'react'
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";

type TreeProps = {
    inputPackage: PythonPackage,
}

const Tree = ({inputPackage}: TreeProps) => {

    const [selection, setSelection ] = useState("");

    return (
        <div className="tree">
            {inputPackage.modules.map(module => (
                <ModuleNode key={module.name}
                            inputModule={module}
                            selection={selection}
                            setSelection={setSelection}/>
            ))}
        </div>
    );
}

export default Tree;