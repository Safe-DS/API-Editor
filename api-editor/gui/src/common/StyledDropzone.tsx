import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import Dropzone from 'react-dropzone';

interface StyledDropzoneProps {
    onDrop: (acceptedFiles: File[]) => void;
    children: React.ReactNode;
}

export const StyledDropzone: React.FC<StyledDropzoneProps> = function ({ onDrop, children }) {
    const borderColor = useColorModeValue('gray.200', 'gray.500');
    const backgroundColor = useColorModeValue('gray.50', 'gray.600');

    return (
        <Box
            padding={4}
            border="3px dashed"
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            textAlign="center"
        >
            <Dropzone onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <Box {...getRootProps()}>
                        <input {...getInputProps()} />
                        {children}
                    </Box>
                )}
            </Dropzone>
        </Box>
    );
};
