import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { App } from './app/App';
import { store } from './app/store';
import apiEditorTheme from './theme';

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ChakraProvider theme={apiEditorTheme}>
                <ColorModeScript initialColorMode={apiEditorTheme.config.initialColorMode} />
                <HashRouter>
                    <App />
                </HashRouter>
            </ChakraProvider>
        </Provider>
    </React.StrictMode>
);
