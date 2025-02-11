import axios from "axios";

export const fetchAllUsersData = async () => {
    try {
        const response = await axios.get('https://samarthmeet.onrender.com/api/users/data');
        // const response = await axios.get('https://samarthmeet.onrender.com/api/users/data');
        console.log('Users Data fetch Successfully :', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch Users Data:', error);
        return null;
    }
};
console.log(fetchAllUsersData())
