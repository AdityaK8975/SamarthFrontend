import axios from "axios";

export const fetchMeetingId = async () => {
    try {
        const response = await axios.get('http://localhost:5000/create-meeting');
        console.log('Meeting Created with Id :', response.data);
        return response.data.channelName;
    } catch (error) {
        console.error('Failed to create meeting:', error);
        return null;
    }
};
// console.log(fetchMeetingId());
