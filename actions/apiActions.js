import axios from 'axios';
import { API_URL } from '../config';

export const FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST';
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
export const FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE';

export const fetchData = () => async (dispatch) => {
    dispatch({ type: FETCH_DATA_REQUEST });
    try {
        const response = await axios.get(`${API_URL}/your-endpoint`);
        dispatch({ type: FETCH_DATA_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_DATA_FAILURE, error });
    }
};