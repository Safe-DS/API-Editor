import React from "react";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonFunction from "../../model/python/PythonFunction";
import {Setter} from "../../util/types";
import ClassView from "./ClassView";
import PythonClass from "../../model/python/PythonClass";
import ModuleView from "./ModuleView";
import PythonModule from "../../model/python/PythonModule";
import FunctionView from "./FunctionView";
import PythonParameter from "../../model/python/PythonParameter";
import ParameterView from "./ParameterView";
import PythonPackage from "../../model/python/PythonPackage";
import {useLocation} from "react-router";

interface SelectionViewProps {
    pythonPackage: PythonPackage,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
}

export default function SelectionView(props: SelectionViewProps): JSX.Element {

    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split("/").splice(2));

    return (
        <div className="parameter-view">
            {declaration instanceof PythonFunction &&
            <FunctionView pythonPackage={props.pythonPackage} annotationStore={props.annotationStore}
                          setAnnotationStore={props.setAnnotationStore}/>
            }
            {declaration instanceof PythonClass &&
            <ClassView pythonPackage={props.pythonPackage}/>
            }
            {declaration instanceof PythonModule &&
            <ModuleView pythonPackage={props.pythonPackage}/>
            }
            {declaration instanceof PythonParameter &&
            <ParameterView pythonPackage={props.pythonPackage}/>}
        </div>
    );
}
