import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    // Set axios defaults once
    useEffect(() => {
        axios.defaults.withCredentials = true;

        // Add axios interceptor for automatic token refresh
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // 🛑 CRITICAL FIX: Prevent Infinite Loop
                // We only retry if:
                // 1. Error is 401 (Unauthorized)
                // 2. We haven't retried this specific request yet
                // 3. The failed URL is NOT the refresh-token endpoint itself
                if (
                    error.response?.status === 401 && 
                    !originalRequest._retry && 
                    !originalRequest.url.includes('/refresh-token')
                ) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh the token
                        const { data } = await axios.post(backendUrl + '/api/auth/refresh-token');
                        
                        if (data.success) {
                            // Retry the original request
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed (or Session Expired), logout user
                        console.error("Session expired or Refresh failed.");
                        setIsLoggedIn(false);
                        setUserData(null);
                        
                        // Optional: Redirect to login or show toast
                        // toast.error("Session expired. Please login again.");
                        
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
            const { data } = await axios.get(backendUrl + '/api/user/data');
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
            // Don't toast 401 errors here, as the interceptor handles them or they are expected on load
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'Failed to get user data');
            }
            setUserData(null);
            setIsLoggedIn(false);
        }
    }, [backendUrl]);

    const getAuthState = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth');
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

