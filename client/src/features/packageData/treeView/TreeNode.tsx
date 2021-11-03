import { HStack, Icon, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ChildrenProp } from '../../../common/util/types';
import PythonDeclaration from '../model/PythonDeclaration';
import {
    selectIsExpandedInTreeView,
    toggleIsExpandedInTreeView,
} from '../packageDataSlice';
import VisibilityIndicator from './VisibilityIndicator';

interface TreeNodeProps extends ChildrenProp {
    declaration: PythonDeclaration;
    icon: IconType;
    isExpandable: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = function ({
    declaration,
    icon,
    isExpandable,
}) {
    const currentPathname = useLocation().pathname;
    const history = useHistory();
    const dispatch = useAppDispatch();

    const showChildren = useAppSelector(
        selectIsExpandedInTreeView(declaration.pathAsString()),
    );

    const level = levelOf(declaration);
    const paddingLeft = level === 0 ? '1rem' : `${1 + 0.75 * level}rem`;
    const backgroundColor = isSelected(declaration, currentPathname)
        ? 'cornflowerblue'
        : undefined;
    const color = isSelected(declaration, currentPathname)
        ? 'white'
        : undefined;

    const handleClick = () => {
        dispatch(toggleIsExpandedInTreeView(declaration.pathAsString()));
        history.push(`/${declaration.pathAsString()}`);
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
            <ChakraText>{declaration.name}</ChakraText>
        </HStack>
    );
};

const levelOf = function (declaration: PythonDeclaration): number {
    return declaration.path().length - 2;
};

const isSelected = function (
    declaration: PythonDeclaration,
    currentPathname: string,
): boolean {
    return `/${declaration.pathAsString()}` === currentPathname;
};

export default TreeNode;
