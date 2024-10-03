import { FETCH_BANKS_REQUEST, FETCH_BANKS_SUCCESS, FETCH_BANKS_FAILURE } from '../actions/bankActions';

const initialState = {
    banks: [],
    loading: false,
    error: null,
};

const bankReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_BANKS_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_BANKS_SUCCESS:
            return { ...state, loading: false, banks: action.payload };
        case FETCH_BANKS_FAILURE:
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
};

export default bankReducer;