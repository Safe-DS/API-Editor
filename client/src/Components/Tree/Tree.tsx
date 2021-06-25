import React from 'react';
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";
import PythonDeclaration from "../../model/PythonDeclaration";

type TreeProps = {
    pythonPackage: PythonPackage,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
};

export default function Tree({pythonPackage,
                              selection,
                              setSelection}: TreeProps): JSX.Element {

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
