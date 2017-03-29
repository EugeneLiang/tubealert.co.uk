'use strict';

import React from 'react';
import {Provider} from 'react-redux';
import store from './store';
import Routes from './routes.jsx';
import { fetchLines, readLines } from './redux/actions/line-actions';

// get the initial data on load (differs between server and client
if (window) {
    store.dispatch(readLines());
} else {
    store.dispatch(fetchLines());
}

export default (
    <Provider store={store}>
        {Routes}
    </Provider>
);