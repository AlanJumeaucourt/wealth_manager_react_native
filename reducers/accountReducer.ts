import { Action } from 'redux';
import { FETCH_ACCOUNTS_REQUEST, FETCH_ACCOUNTS_SUCCESS, FETCH_ACCOUNTS_FAILURE, CREATE_ACCOUNT_REQUEST, CREATE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_FAILURE } from '../actions/accountActions';

const initialState = {
    accounts: [],
    loading: false,
    error: null,
};

const accountReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case FETCH_ACCOUNTS_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_ACCOUNTS_SUCCESS:
            return { ...state, loading: false, accounts: action.payload };
        case FETCH_ACCOUNTS_FAILURE:
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
};

export default accountReducer;