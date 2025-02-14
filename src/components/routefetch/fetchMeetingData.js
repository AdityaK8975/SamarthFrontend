import axios from 'axios';

export const fetchMeetingsByUserId = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/meetings/data?userId=${userId}`);
        
        if (response.data && response.data.length === 0) {
            return null;
        }
        const sortedMeetings = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));


        return sortedMeetings;
    } catch (error) {
        console.error('Failed to fetch Meetings Data:', error);
        return null;
    }
};

// console.log(fetchMeetingsByUserId(1111));

