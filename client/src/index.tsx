import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import App from './app/App';
import { store } from './app/store';
import apiEditorTheme from './theme';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ChakraProvider theme={apiEditorTheme}>
                <ColorModeScript initialColorMode={apiEditorTheme.config.initialColorMode} />
                <HashRouter>
                    <App />
                </HashRouter>
            </ChakraProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);
