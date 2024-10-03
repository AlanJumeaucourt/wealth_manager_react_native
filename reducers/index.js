import { combineReducers } from 'redux';
import apiReducer from './apiReducer';
import accountReducer from './accountReducer';
import bankReducer from './bankReducer';

const rootReducer = combineReducers({
    api: apiReducer,
    accounts: accountReducer,
    banks: bankReducer,
    // Add other reducers here
});

export default rootReducer;