// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = 'https://growing-staging-backend.xsxjch.easypanel.host/api';

// Token de autenticación
let authToken = localStorage.getItem('authToken') || null;

// ==========================================
// Auth Functions
// ==========================================
async function loginUser(email, password) {
    try {
        console.log('Login attempt:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok && data.success) {
            // CORREGIDO: acceder a data.data.token y data.data.user
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Register response:', data);
        
        if (response.ok && data.success) {
            // CORREGIDO: acceder a data.data.token y data.data.user
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
    localStorage.removeItem('currentChat');
}

// ==========================================
// Chat Functions
// ==========================================
async function sendMessage(message, category) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                message,
                category,
                chatId: getCurrentChatId()
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, response: data.response, messageId: data.messageId };
        } else {
            return { success: false, error: data.message || 'Error al enviar mensaje' };
        }
    } catch (error) {
        console.error('Send message error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function loadChatHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, chats: data.chats };
        } else {
            return { success: false, error: data.message || 'Error al cargar historial' };
        }
    } catch (error) {
        console.error('Load history error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function loadChatMessages(chatId) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, messages: data.messages };
        } else {
            return { success: false, error: data.message || 'Error al cargar mensajes' };
        }
    } catch (error) {
        console.error('Load messages error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function createNewChat(category, title) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ category, title })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentChat', data.chatId);
            return { success: true, chatId: data.chatId };
        } else {
            return { success: false, error: data.message || 'Error al crear chat' };
        }
    } catch (error) {
        console.error('Create chat error:', error);
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
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, users: data.users };
        } else {
            return { success: false, error: data.message || 'Error al cargar usuarios' };
        }
    } catch (error) {
        console.error('Load users error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function uploadDocument(file, category) {
    try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('category', category);

        const response = await fetch(`${API_BASE_URL}/admin/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, documentId: data.documentId };
        } else {
            return { success: false, error: data.message || 'Error al subir documento' };
        }
    } catch (error) {
        console.error('Upload document error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, analytics: data };
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
function getCurrentChatId() {
    return localStorage.getItem('currentChat') || null;
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
// Export functions for use in HTML
// ==========================================
window.API = {
    // Auth
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    
    // Chat
    sendMessage,
    loadChatHistory,
    loadChatMessages,
    createNewChat,
    
    // Admin
    loadUsers,
    uploadDocument,
    getAnalytics,
    
    // Settings
    updateProfile,
    changePassword,
    
    // Helpers
    getCurrentUser,
    isAuthenticated,
    isAdmin
};

console.log('API client loaded');
