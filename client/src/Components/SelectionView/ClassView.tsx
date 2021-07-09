import React from "react";
import DocumentationText from "./DocumentationText";
import PythonClass from "../../model/python/PythonClass";
import ClassViewItem from "./ClassViewItem";

interface ClassViewProps {
    pythonClass: PythonClass,
}

export default function ClassView(props: ClassViewProps): JSX.Element {

    return (
        <>
            <h1>{props.pythonClass.name}</h1>
            <DocumentationText inputText={props.pythonClass.description}/>
            <ClassViewItem title={"Superclasses"} inputElements={props.pythonClass.superclasses}/>
            <ClassViewItem title={"Decorators"} inputElements={props.pythonClass.decorators}/>
        </>
    );
}
