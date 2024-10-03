import axios from 'axios';

export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST';
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS';
export const FETCH_ACCOUNTS_FAILURE = 'FETCH_ACCOUNTS_FAILURE';
import { API_URL } from '../config';

export const fetchAccounts = () => async (dispatch) => {
    console.log("fetchAccounts");
    dispatch({ type: FETCH_ACCOUNTS_REQUEST });
    try {
        const response = await axios.get(`${API_URL}/accounts`);
        dispatch({ type: FETCH_ACCOUNTS_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_ACCOUNTS_FAILURE, error });
    }
};