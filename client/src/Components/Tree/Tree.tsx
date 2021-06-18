import React from 'react'
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";

type TreeProps = {
    pythonPackage: PythonPackage,
    setParameters: any,
    selection: string[],
    setSelection: any
}

const Tree = ({pythonPackage, setParameters, selection, setSelection}: TreeProps) => {

    const path = [pythonPackage.name];

    return (
        <div className="tree">
            {pythonPackage.modules.map(module => (
                <ModuleNode parentPath = { path }
                            key={module.name}
                            pythonModule={module}
                            selection={selection}
                            setSelection={setSelection}
                            setParameters={setParameters}/>
            ))}
        </div>
    );
}

export default Tree;