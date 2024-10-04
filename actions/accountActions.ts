import axios from 'axios';
import { API_URL } from '../config';
import { Dispatch } from 'redux';
import { Account } from '@/types/account';

export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST';
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS';
export const FETCH_ACCOUNTS_FAILURE = 'FETCH_ACCOUNTS_FAILURE';
export const CREATE_ACCOUNT_REQUEST = 'CREATE_ACCOUNT_REQUEST';
export const CREATE_ACCOUNT_SUCCESS = 'CREATE_ACCOUNT_SUCCESS';
export const CREATE_ACCOUNT_FAILURE = 'CREATE_ACCOUNT_FAILURE';


export const fetchAccounts = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_ACCOUNTS_REQUEST });
    try {
        const response = await axios.get(`${API_URL}/accounts?per_page=100&page=1`);
        console.log("fetchAccounts response", response.data);
        dispatch({ type: FETCH_ACCOUNTS_SUCCESS, payload: response.data });
    } catch (error) {
        console.log("fetchAccounts error", error);
        dispatch({ type: FETCH_ACCOUNTS_FAILURE, error });
    }
};