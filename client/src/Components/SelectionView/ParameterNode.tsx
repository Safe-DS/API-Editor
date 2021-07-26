import classNames from 'classnames'
import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
    EnumAnnotation,
    removeEnum,
    removeRenaming,
    selectEnum,
    selectRenaming,
    upsertEnum,
    upsertRenaming,
} from '../../features/annotations/annotationSlice'
import EnumDialog from '../../features/annotations/dialogs/EnumDialog/EnumDialog'
import RenameDialog from '../../features/annotations/dialogs/RenameDialog'
import PythonParameter from '../../model/python/PythonParameter'
import { Optional } from '../../util/types'
import AnnotationView from './AnnotationView'
import DocumentationText from './DocumentationText'
import ParameterNodeCSS from './ParameterNode.module.css'

interface ParameterNodeProps {
    pythonParameter: PythonParameter
    isTitle: boolean
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [showEnumDialog, setShowEnumDialog] = useState(false)
    const dispatch = useAppDispatch()
    const id = props.pythonParameter.pathAsString()

    const newName = useAppSelector(selectRenaming(id))?.newName
    const setNewName = (newName: Optional<string>) => {
        if (newName === undefined || newName === null || newName === props.pythonParameter.name) {
            dispatch(removeRenaming(id))
        } else {
            dispatch(
                upsertRenaming({
                    target: id,
                    newName,
                }),
            )
        }
    }

    const newEnumDefinition = useAppSelector(selectEnum(id))
    const setNewEnumDefinition = (newEnum: Optional<EnumAnnotation>) => {
        if (newEnum === undefined || newEnum === null) {
            dispatch(removeEnum(id))
        } else {
            dispatch(upsertEnum(newEnum))
        }
    }

    const openRenameDialog = () => setShowRenameDialog(true)
    const openEnumDialog = () => setShowEnumDialog(true)

    const dropdownClassnames = classNames({
        [ParameterNodeCSS.parameterIsTitle]: props.isTitle,
    })

    return (
        <div>
            <div className={ParameterNodeCSS.parameterHeader}>
                {props.isTitle ? (
                    <h1 className={ParameterNodeCSS.parameterName}>{props.pythonParameter.name}</h1>
                ) : (
                    <h4 className={ParameterNodeCSS.parameterName}>{props.pythonParameter.name}</h4>
                )}
                <div className={dropdownClassnames}>
                    <Dropdown>
                        <Dropdown.Toggle size="sm" variant="primary">
                            + @Annotation
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onSelect={openRenameDialog}>@Rename</Dropdown.Item>
                            <Dropdown.Item onSelect={openEnumDialog}>@Enum</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            {(newName || newEnumDefinition) && (
                <>
                    <h5 className="pl-1rem">Annotations</h5>
                    <div className={ParameterNodeCSS.annotationList}>
                        <AnnotationView
                            type="rename"
                            name={newName}
                            onEdit={openRenameDialog}
                            onDelete={() => setNewName(null)}
                        />
                        <AnnotationView
                            type="enum"
                            name={newEnumDefinition?.enumName}
                            onEdit={openEnumDialog}
                            onDelete={() => setNewEnumDefinition(null)}
                        />
                    </div>
                </>
            )}

            {/*This additional check cause the dialog to be thrown away after closing it, resetting its state*/}
            {showRenameDialog && (
                <RenameDialog
                    target={props.pythonParameter}
                    isVisible={showRenameDialog}
                    setIsVisible={setShowRenameDialog}
                />
            )}

            {showEnumDialog && (
                <EnumDialog target={id} dialogState={showEnumDialog} setDialogState={setShowEnumDialog} />
            )}

            {props.pythonParameter.description ? (
                <DocumentationText inputText={props.pythonParameter?.description} />
            ) : (
                <p className="pl-1rem text-muted">There is no documentation for this parameter.</p>
            )}
        </div>
    )
}
