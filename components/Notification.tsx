import { ChevronDown } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';

interface NotificationProps {
    message: string | null;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 1000); // Close after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        /* <View style={[styles.notificationContainer, type === 'success' ? styles.success : styles.error]}>
            <Text style={styles.notificationText}>{message}</Text>
        </View> */
        <View>
            <Alert icon={ChevronDown} className='max-w-xl'>
                <AlertTitle>{type}</AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
            </Alert>
        </View>
        
    );
};

/* const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        right: '10%',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        zIndex: 1000,
    },
    success: {
        backgroundColor: 'green',
    },
    error: {
        backgroundColor: 'red',
    },
    notificationText: {
        color: 'white',
    },
}); */

export default Notification;