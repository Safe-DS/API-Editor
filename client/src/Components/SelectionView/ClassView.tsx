import React from 'react'
import PythonClass from '../../model/python/PythonClass'
import DocumentationText from './DocumentationText'
import SectionListViewItem from './SectionListViewItem'

interface ClassViewProps {
    pythonClass: PythonClass
}

export default function ClassView(props: ClassViewProps): JSX.Element {
    return (
        <div>
            <h1>{props.pythonClass.name}</h1>
            {props.pythonClass.description ? (
                <DocumentationText inputText={props.pythonClass.description} />
            ) : (
                <p className="pl-1rem text-muted">There is no documentation for this class.</p>
            )}
            <SectionListViewItem title={'Superclasses'} inputElements={props.pythonClass.superclasses} />
            <SectionListViewItem title={'Decorators'} inputElements={props.pythonClass.decorators} />
        </div>
    )
}
