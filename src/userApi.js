import axios from 'axios';

const createUser = async (userData) => {
  try {
    const response = await axios.post('https://localhost:7296/Users', userData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error);
    throw error;
  }
};

export { createUser };