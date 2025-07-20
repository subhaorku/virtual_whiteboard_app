const API_BASE_URL = 'http://localhost:3030/canvases'; // Replace with your actual API base URL


export const updateCanvas = async (canvasId, elements) => {
    try{
        const token = localStorage.getItem('token');
        if(!token) {
            throw new Error('User not authenticated');
        }
        const response = await fetch(`${API_BASE_URL}/${canvasId}`, {
            method: 'PUT',
            headers: {
                // contentType: 'application/json',
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ elements }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update canvas');
        }
        return data;
    } catch (error) {
        console.error('Error updating canvas:', error);
        throw error;
    }
}

