import axios from 'axios';
import { API_URL } from '../config';
import { Dispatch } from 'redux';

export const FETCH_BANKS_REQUEST = 'FETCH_BANKS_REQUEST';
export const FETCH_BANKS_SUCCESS = 'FETCH_BANKS_SUCCESS';
export const FETCH_BANKS_FAILURE = 'FETCH_BANKS_FAILURE';

export const fetchBanks = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BANKS_REQUEST });
    try {
        const response = await axios.get(`${API_URL}/banks?per_page=100&page=1`);
        console.log("fetchBanks response", response.data);
        dispatch({ type: FETCH_BANKS_SUCCESS, payload: response.data });
    } catch (error) {
        console.log("fetchBanks error", error);
        dispatch({ type: FETCH_BANKS_FAILURE, error });
    }
};