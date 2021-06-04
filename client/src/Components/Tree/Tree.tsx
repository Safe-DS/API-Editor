import React, {useState} from 'react'
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";

type TreeProps = {
    pythonPackage: PythonPackage,
    setParameters: any,
}

const Tree = ({pythonPackage, setParameters}: TreeProps) => {

    const [selection, setSelection ] = useState("");

    return (
        <div className="tree">
            {pythonPackage.modules.map(module => (
                <ModuleNode key={module.name}
                            pythonModule={module}
                            selection={selection}
                            setSelection={setSelection}
                            setParameters={setParameters}/>
            ))}
        </div>
    );
}

export default Tree;