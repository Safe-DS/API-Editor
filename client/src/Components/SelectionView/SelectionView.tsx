import React from "react";
import {useLocation} from "react-router";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonClass from "../../model/python/PythonClass";
import PythonFunction from "../../model/python/PythonFunction";
import PythonModule from "../../model/python/PythonModule";
import PythonPackage from "../../model/python/PythonPackage";
import PythonParameter from "../../model/python/PythonParameter";
import {Setter} from "../../util/types";
import ClassView from "./ClassView";
import FunctionView from "./FunctionView";
import ModuleView from "./ModuleView";
import ParameterView from "./ParameterView";

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
            <ModuleView pythonModule={declaration}/>
            }
            {declaration instanceof PythonParameter &&
            <ParameterView pythonPackage={props.pythonPackage} annotationStore={props.annotationStore}
                           setAnnotationStore={props.setAnnotationStore}/>}
        </div>
    );
}
