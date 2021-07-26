import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {}

const theme = extendTheme({
    config,
    layerStyles: {
        subtleBorder: {
            borderStyle: 'solid',
            borderColor: 'gray.200',
            '.chakra-ui-dark &': {
                borderColor: 'gray.700',
            },
        },
    },
})
export default theme
