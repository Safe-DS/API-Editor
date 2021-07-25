import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { store } from './app/store'
import App from './app/App'
import './index.css'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <HashRouter>
                <ChakraProvider theme={theme}>
                    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                    <App />
                </ChakraProvider>
            </HashRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
)
