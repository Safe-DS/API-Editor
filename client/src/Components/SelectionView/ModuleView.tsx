import React from "react";
import PythonModule from "../../model/python/PythonModule";
import {isEmptyList} from "../../util/listOperations";
import ModuleImportItem from "./ModuleImportItem";
import ModuleImportFromItem from "./ModuleImportFromItem";
import PythonPackage from "../../model/python/PythonPackage";
import {useLocation} from "react-router";

interface ModuleViewProps {
    pythonPackage: PythonPackage,
}

export default function ModuleView(props: ModuleViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <>
            {declaration instanceof PythonModule &&
        <>
            <h1>{declaration.name}</h1>
            <h2>Imports</h2>
            {!isEmptyList(declaration.imports) ?
                <ul className="module-list">
                    {declaration.imports.map((pythonImport, index) => (
                        <li key={index}>
                            <ModuleImportItem inputImport={pythonImport}/>
                        </li>
                    ))}
                </ul>
                : <span className="text-muted"
                        style={{paddingLeft: '2rem'}}>There are no imports.</span>
            }
            <h2>Imported from</h2>
            {!isEmptyList(declaration.fromImports) ?
                <ul className="module-list">
                    {declaration.fromImports.map((pythonImportFrom, index) => (
                        <li key={index}>
                            <ModuleImportFromItem inputImportFrom={pythonImportFrom}/>
                        </li>
                    ))}
                </ul>
                : <span className="text-muted"
                          style={{paddingLeft: '2rem'}}>There are no modules that import this module.</span>}
        </>
            }
        </>
    );
}
