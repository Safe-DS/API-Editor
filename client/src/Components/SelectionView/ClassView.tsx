import React from "react";
import DocumentationText from "./DocumentationText";
import PythonClass from "../../model/python/PythonClass";
import SectionListViewItem from "./SectionListViewItem";
import PythonPackage from "../../model/python/PythonPackage";
import {useLocation} from "react-router";

interface ClassViewProps {
    pythonPackage: PythonPackage,
}

export default function ClassView(props: ClassViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <>
            {declaration instanceof PythonClass &&
            <>
                <h1>{declaration.name}</h1>
                <DocumentationText inputText={declaration.description}/>
                <SectionListViewItem title={"Superclasses"} inputElements={declaration.superclasses}/>
                <SectionListViewItem title={"Decorators"} inputElements={declaration.decorators}/>
            </>
            }
        </>
    );
}
