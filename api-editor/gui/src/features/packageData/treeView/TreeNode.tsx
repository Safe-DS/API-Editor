import { HStack, Icon, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../model/PythonDeclaration';
import { selectIsExpandedInTreeView, toggleIsExpandedInTreeView } from '../packageDataSlice';
import VisibilityIndicator from './VisibilityIndicator';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { selectAnnotations } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';

interface TreeNodeProps {
    declaration: PythonDeclaration;
    icon: IconType;
    isExpandable: boolean;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const TreeNode: React.FC<TreeNodeProps> = function ({ declaration, icon, isExpandable, filter, usages }) {
    const currentPathname = useLocation().pathname;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const showChildren = useAppSelector(selectIsExpandedInTreeView(declaration.pathAsString()));
    const annotations = useAppSelector(selectAnnotations);

    const level = levelOf(declaration);
    const paddingLeft = level === 0 ? '1rem' : `${1 + 0.75 * level}rem`;
    const backgroundColor = isSelected(declaration, currentPathname) ? 'cornflowerblue' : undefined;
    const color = isSelected(declaration, currentPathname) ? 'white' : undefined;

    const fontWeight = filter.shouldKeepDeclaration(declaration, annotations, usages) ? 'bold' : undefined;

    const handleClick = () => {
        dispatch(toggleIsExpandedInTreeView(declaration.pathAsString()));
        navigate(`/${declaration.pathAsString()}`);
    };

    return (
        <HStack
            userSelect="none"
            cursor="pointer"
            color={color}
            backgroundColor={backgroundColor}
            paddingLeft={paddingLeft}
            onClick={handleClick}
        >
            <VisibilityIndicator
                hasChildren={isExpandable}
                showChildren={showChildren}
                isSelected={isSelected(declaration, currentPathname)}
            />
            <Icon as={icon} />
            <ChakraText fontWeight={fontWeight}>{declaration.getUniqueName()}</ChakraText>
        </HStack>
    );
};

const levelOf = function (declaration: PythonDeclaration): number {
    return declaration.path().length - 2;
};

const isSelected = function (declaration: PythonDeclaration, currentPathname: string): boolean {
    return `/${declaration.pathAsString()}` === currentPathname;
};

export default TreeNode;
