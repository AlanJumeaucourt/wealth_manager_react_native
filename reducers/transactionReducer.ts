import { Action } from 'redux';
import { FETCH_TRANSACTIONS_REQUEST, FETCH_TRANSACTIONS_SUCCESS, FETCH_TRANSACTIONS_FAILURE, ADD_TRANSACTION_REQUEST, ADD_TRANSACTION_SUCCESS, ADD_TRANSACTION_FAILURE } from '../actions/transactionActions';

const initialState = {
    transactions: [],
    loading: false,
    error: null,
};

const transactionReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case FETCH_TRANSACTIONS_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_TRANSACTIONS_SUCCESS:
            return { ...state, loading: false, transactions: action.payload };
        case FETCH_TRANSACTIONS_FAILURE:
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
};

export default transactionReducer;