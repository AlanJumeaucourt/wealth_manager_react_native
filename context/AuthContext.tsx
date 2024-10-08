import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/app/api/axiosConfig';
import { API_URL } from '../config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainNavigator } from '@/app/index';
import { AuthNavigator } from '@/app/index';


const Stack = createNativeStackNavigator();


interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // Verify the token with an API call
                try {
                    const response = await apiClient.get(`${API_URL}/users/verify-token`);
                    if (response.status === 200) {
                        setIsLoggedIn(true);
                    } else {
                        setIsLoggedIn(false);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
        };
        checkToken();
    }, []);

    const login = async (token: string) => {
        await AsyncStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {isLoggedIn ? (
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};