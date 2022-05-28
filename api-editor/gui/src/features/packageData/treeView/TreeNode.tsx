import { Box, Circle, HStack, Icon, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../model/PythonDeclaration';
import { selectHeatMapMode, selectIsExpandedInTreeView, toggleIsExpandedInTreeView } from '../packageDataSlice';
import VisibilityIndicator from './VisibilityIndicator';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { selectAnnotations } from '../../annotations/annotationSlice';
import { UsageCountJson, UsageCountStore } from '../../usages/model/UsageCountStore';

interface TreeNodeProps {
    declaration: PythonDeclaration;
    icon: IconType;
    isExpandable: boolean;
    filter: AbstractPythonFilter;
    maxValue?: number;
    specificValue?: number;
}

const TreeNode: React.FC<TreeNodeProps> = function ({
    declaration,
    icon,
    isExpandable,
    filter,
    maxValue,
    specificValue,
}) {
    const currentPathname = useLocation().pathname;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const showChildren = useAppSelector(selectIsExpandedInTreeView(declaration.pathAsString()));
    const annotations = useAppSelector(selectAnnotations);

    const level = levelOf(declaration);
    const paddingLeft = level === 0 ? '1rem' : `${1 + 0.75 * level}rem`;
    const backgroundColor = isSelected(declaration, currentPathname) ? 'cornflowerblue' : undefined;
    const color = isSelected(declaration, currentPathname) ? 'white' : undefined;

    const fontWeight = filter.shouldKeepDeclaration(declaration, annotations) ? 'bold' : undefined;

    const handleClick = () => {
        dispatch(toggleIsExpandedInTreeView(declaration.pathAsString()));
        navigate(`/${declaration.pathAsString()}`);
    };

    const display_heat_map = useAppSelector(selectHeatMapMode);
    const heat_color =
        specificValue !== undefined && specificValue !== 0
            ? getColorFromValue(maxValue as number, specificValue)
            : undefined;
    const box_width = maxValue !== undefined ? (maxValue.toString().length + 1) * 7.3 : undefined;
    //const text_border_color = (specificValue === 0) ? "black" : undefined;
    //Todo : change to tag
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
            {display_heat_map && (
                <Box
                    bg={heat_color}
                    color="white"
                    width={box_width}
                    borderRadius="full"
                    height="18px"
                    fontWeight="bold"
                    fontSize="small"
                    textAlign="center"
                    px="2px"
                >
                    {specificValue}
                </Box>
            )}
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

const getColorFromValue = function (maxValue: number, specificValue: number): string {
    const percentage = Math.log(specificValue) / Math.log(maxValue);
    const value = percentage * 255;

    return `rgb(${value}%, 0%, ${255 - value}%)`;
};

export default TreeNode;
