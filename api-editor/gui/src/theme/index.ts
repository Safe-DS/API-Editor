import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode, Styles } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {};

const styles: Styles = {
    // @ts-ignore
    global(props) {
        const controlStyle = {
            border: '1px solid',
            borderColor: mode('gray.400', 'gray.400')(props),
            background: mode('gray.300', 'gray.500')(props),
        };
        const controlHoverStyle = {};

        return {
            '::-webkit-scrollbar': {
                width: 3,
                height: 3,
            },
            '::-webkit-scrollbar-track': {
                background: mode('gray.100', 'gray.700')(props),
            },
            '::-webkit-scrollbar-thumb': controlStyle,
            '::-webkit-scrollbar-thumb:hover': controlHoverStyle,
            '::-webkit-resizer': controlStyle,
            // This does not seem to do anything, just leaving it in because this is how it should behave
            '::-webkit-resizer:hover': controlHoverStyle,
        };
    },
};

const breakpoints = {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
    fullHD: '1920px',
    wqhd: '2560px',
    '4kuhd': '3840px',
};

const apiEditorTheme = extendTheme({
    config,
    styles,
    breakpoints,
    layerStyles: {
        subtleBorder: {
            borderStyle: 'solid',
            borderColor: 'gray.200',
            '.chakra-ui-dark &': {
                borderColor: 'gray.700',
            },
        },
    },
});
// eslint-disable-next-line import/no-default-export
export default apiEditorTheme;
