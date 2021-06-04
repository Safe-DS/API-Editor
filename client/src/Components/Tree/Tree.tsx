import React, {useState} from 'react'
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";

type TreeProps = {
    pythonPackage: PythonPackage,
}

const Tree = ({pythonPackage}: TreeProps) => {

    const [selection, setSelection ] = useState("");

    return (
        <div className="tree">
            {pythonPackage.modules.map(module => (
                <ModuleNode key={module.name}
                            pythonModule={module}
                            selection={selection}
                            setSelection={setSelection}/>
            ))}
        </div>
    );
}

export default Tree;