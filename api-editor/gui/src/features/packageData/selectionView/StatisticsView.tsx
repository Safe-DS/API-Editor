import { Heading, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import PythonDeclaration from '../model/PythonDeclaration';
import ParameterNode from './ParameterNode';

interface StatisticsViewProps {
    pythonDeclaration: PythonDeclaration;
}

const StatisticsView: React.FC<StatisticsViewProps> = function ({
}) {
    return (
        <h4>Statistics</h4>
    );
};

export default StatisticsView;
