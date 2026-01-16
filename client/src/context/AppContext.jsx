import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    // Set axios defaults once
    React.useEffect(() => {
        axios.defaults.withCredentials = true;

        // Add axios interceptor for automatic token refresh
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 and we haven't retried yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh the token
                        const { data } = await axios.post(backendUrl + '/api/auth/refresh-token');
                        
                        if (data.success) {
                            // Retry the original request
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        setIsLoggedIn(false);
                        setUserData(null);
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [backendUrl]);

    const getUserData = useCallback(async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data');
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedIn(true);
            } else {
                toast.error(data.message);
                setUserData(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Failed to get user data:', error);
            toast.error(error.response?.data?.message || 'Failed to get user data');
            setUserData(null);
            setIsLoggedIn(false);
        }
    }, [backendUrl]);

    const getAuthState = useCallback(async ()=> {
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth');
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            setIsLoggedIn(false);
            setUserData(null);
            // Don't show toast error for auth check as it's called on app load
        }
    }, [backendUrl, getUserData]);

    useEffect(() => {
        getAuthState();
    }, [getAuthState]);

    const value = {
        backendUrl, 
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
        getAuthState
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}

