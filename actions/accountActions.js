import axios from 'axios';

export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST';
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS';
export const FETCH_ACCOUNTS_FAILURE = 'FETCH_ACCOUNTS_FAILURE';
import { API_URL } from '../config';

export const fetchAccounts = () => async (dispatch) => {
    dispatch({ type: FETCH_ACCOUNTS_REQUEST });
    try {
        const response = await axios.get(`${API_URL}/accounts`);
        console.log("fetchAccounts response", response.data);
        dispatch({ type: FETCH_ACCOUNTS_SUCCESS, payload: response.data });
    } catch (error) {
        console.log("fetchAccounts error", error);
        dispatch({ type: FETCH_ACCOUNTS_FAILURE, error });
    }
};