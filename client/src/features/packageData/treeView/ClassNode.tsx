import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';

interface ClassNodeProps {
    pythonClass: PythonClass;
}

const ClassNode: React.FC<ClassNodeProps> = (props: ClassNodeProps) => {
    const hasMethods = !isEmptyList(props.pythonClass.methods);

    return <TreeNode declaration={props.pythonClass} icon={FaChalkboard} isExpandable={hasMethods} />;
};

export default ClassNode;
