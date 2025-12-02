// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = 'https://growing-staging-backend.xsxjch.easypanel.host/api';

let authToken = localStorage.getItem('authToken') || null;

// ==========================================
// Auth Functions
// ==========================================
async function loginUser(email, password) {
    try {
        console.log('Login attempt:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok && data.success) {
            authToken = data.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return { success: true, user: data.data.user };
        } else {
            return { success: false, error: data.message || 'Error al iniciar sesión' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function registerUser(userData) {
    try {
        console.log('Register attempt:', userData.email);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Register response:', data);
        
        if (response.ok && data.success) {
            authToken = data.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return { success: true, user: data.data.user };
        } else {
            return { success: false, error: data.message || 'Error al registrar usuario' };
        }
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

function logoutUser() {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentConversation');
}

// ==========================================
// Chat Functions
// ==========================================
async function sendMessage(message, conversationId = null, imageBase64 = null, imageMimeType = null) {
    try {
        const body = { message };
        if (conversationId) {
            body.conversationId = conversationId;
        }
        if (imageBase64) {
            body.image = {
                data: imageBase64,
                mimeType: imageMimeType || 'image/jpeg'
            };
        }

        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Send message response:', data);
        
        if (response.ok && data.success) {
            return { 
                success: true, 
                conversation: data.data.conversation,
                userMessage: data.data.userMessage,
                botMessage: data.data.botMessage
            };
        } else {
            return { success: false, error: data.message || 'Error al enviar mensaje' };
        }
    } catch (error) {
        console.error('Send message error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function loadConversations(limit = 20, offset = 0) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversations?limit=${limit}&offset=${offset}`, 
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        const data = await response.json();
        console.log('Load conversations response:', data);
        
        if (response.ok && data.success) {
            return { 
                success: true, 
                conversations: data.data.conversations,
                pagination: data.data.pagination
            };
        } else {
            return { success: false, error: data.message || 'Error al cargar conversaciones' };
        }
    } catch (error) {
        console.error('Load conversations error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function loadConversation(conversationId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversation/${conversationId}`, 
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        const data = await response.json();
        console.log('Load conversation response:', data);
        
        if (response.ok && data.success) {
            return { 
                success: true, 
                conversation: data.data
            };
        } else {
            return { success: false, error: data.message || 'Error al cargar conversación' };
        }
    } catch (error) {
        console.error('Load conversation error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function renameConversation(conversationId, newTitle) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversation/${conversationId}`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ title: newTitle })
            }
        );

        const data = await response.json();
        console.log('Rename conversation response:', data);
        
        if (response.ok && data.success) {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Error al renombrar conversación' };
        }
    } catch (error) {
        console.error('Rename conversation error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function deleteConversation(conversationId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversation/${conversationId}`, 
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        const data = await response.json();
        console.log('Delete conversation response:', data);
        
        if (response.ok && data.success) {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Error al eliminar conversación' };
        }
    } catch (error) {
        console.error('Delete conversation error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function searchConversations(query) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/search?q=${encodeURIComponent(query)}`, 
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true, conversations: data.data };
        } else {
            return { success: false, error: data.message || 'Error en búsqueda' };
        }
    } catch (error) {
        console.error('Search error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function rateConversation(conversationId, rating, feedback = null) {
    try {
        const body = { rating };
        if (feedback) body.feedback = feedback;

        const response = await fetch(
            `${API_BASE_URL}/chat/conversation/${conversationId}/rate`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Error al calificar' };
        }
    } catch (error) {
        console.error('Rate error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ==========================================
// Admin Functions
// ==========================================
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, users: data.users || data.data?.users };
        } else {
            return { success: false, error: data.message || 'Error al cargar usuarios' };
        }
    } catch (error) {
        console.error('Load users error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, analytics: data.data || data };
        } else {
            return { success: false, error: data.message || 'Error al cargar analíticas' };
        }
    } catch (error) {
        console.error('Load analytics error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ==========================================
// Settings Functions
// ==========================================
async function updateProfile(profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('user', JSON.stringify(data.data));
            return { success: true, user: data.data };
        } else {
            return { success: false, error: data.message || 'Error al actualizar perfil' };
        }
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Error al cambiar contraseña' };
        }
    } catch (error) {
        console.error('Change password error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ==========================================
// Helper Functions
// ==========================================
function getCurrentConversationId() {
    return localStorage.getItem('currentConversation') || null;
}

function setCurrentConversationId(id) {
    if (id) {
        localStorage.setItem('currentConversation', id);
    } else {
        localStorage.removeItem('currentConversation');
    }
}

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
            return null;
        }
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('user');
        return null;
    }
}

function isAuthenticated() {
    return authToken !== null && getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// ==========================================
// Export functions
// ==========================================
window.API = {
    // Auth
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    
    // Chat
    sendMessage,
    loadConversations,
    loadConversation,
    renameConversation,
    deleteConversation,
    searchConversations,
    rateConversation,
    
    // Admin
    loadUsers,
    getAnalytics,
    
    // Settings
    updateProfile,
    changePassword,
    
    // Helpers
    getCurrentUser,
    getCurrentConversationId,
    setCurrentConversationId,
    isAuthenticated,
    isAdmin
};

console.log('API client loaded');
