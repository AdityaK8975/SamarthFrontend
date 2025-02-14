import axios from 'axios';

const API_URL = "http://localhost:5000/api/notifications";

export const fetchNotificationsByUserId = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`);
        
        if (response.data && response.data.length === 0) {
            return null;
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch Notifications Data:', error);
        return null;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        await axios.patch(`${API_URL}/mark-as-read/${notificationId}`, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

// console.log(fetchNotificationsByUserId(1111));