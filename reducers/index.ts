import { combineReducers } from 'redux';
import apiReducer from './apiReducer';
import accountReducer from './accountReducer';
import bankReducer from './bankReducer';
import transactionReducer from './transactionReducer';

const rootReducer = combineReducers({
    api: apiReducer,
    accounts: accountReducer,
    banks: bankReducer,
    transactions: transactionReducer,
});

export default rootReducer;