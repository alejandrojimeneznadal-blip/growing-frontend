// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = 'https://growing-staging-backend.xsxjch.easypanel.host/api';

let authToken = localStorage.getItem('authToken') || null;

// ==========================================
// Helper: Handle 401 errors (token expired/invalid)
// ==========================================
function handle401Error() {
    console.warn('401 Unauthorized - Token invalid or expired. Forcing re-login.');
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentConversation');

    // Redirect to login if not already there
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/';
    }
}

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
async function sendMessage(message, conversationId = null, imageBase64 = null, imageMimeType = null, category = null) {
    try {
        // Debug: Log auth status
        console.log('sendMessage - authToken exists:', !!authToken);
        console.log('sendMessage - authToken value:', authToken ? authToken.substring(0, 20) + '...' : 'null');

        if (!authToken) {
            console.error('No auth token available');
            handle401Error();
            return { success: false, error: 'No hay sesión activa. Por favor, inicia sesión.' };
        }

        const body = { message };
        if (conversationId) {
            body.conversationId = conversationId;
        }
        if (category) {
            body.category = category;
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

        // Handle 401 specifically
        if (response.status === 401) {
            handle401Error();
            return { success: false, error: 'Sesión expirada. Por favor, inicia sesión de nuevo.' };
        }

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
        if (!authToken) {
            handle401Error();
            return { success: false, error: 'No hay sesión activa' };
        }

        const response = await fetch(
            `${API_BASE_URL}/chat/conversations?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        if (response.status === 401) {
            handle401Error();
            return { success: false, error: 'Sesión expirada' };
        }

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

async function updateConversationCategory(conversationId, category) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversation/${conversationId}`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ category: category })
            }
        );

        const data = await response.json();
        console.log('Update category response:', data);
        
        if (response.ok && data.success) {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Error al actualizar categoría' };
        }
    } catch (error) {
        console.error('Update category error:', error);
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
// Feedback Functions
// ==========================================
async function saveFeedback(feedbackData) {
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(feedbackData)
        });

        const data = await response.json();
        console.log('Save feedback response:', data);
        
        if (response.ok && data.success) {
            return { success: true, feedback: data.data };
        } else {
            return { success: false, error: data.message || 'Error al guardar feedback' };
        }
    } catch (error) {
        console.error('Save feedback error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getConversationFeedback(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/feedback/conversation/${conversationId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        console.log('Get conversation feedback response:', data);

        if (response.ok && data.success) {
            return { success: true, feedbacks: data.data };
        } else {
            return { success: false, error: data.message || 'Error al cargar feedback' };
        }
    } catch (error) {
        console.error('Get conversation feedback error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getFeedbackStats(params = {}) {
    try {
        const query = new URLSearchParams();
        if (params.startDate) query.append('startDate', params.startDate);
        if (params.endDate) query.append('endDate', params.endDate);
        if (params.category) query.append('category', params.category);

        const response = await fetch(`${API_BASE_URL}/feedback/stats?${query.toString()}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true, stats: data.data };
        } else {
            return { success: false, error: data.message || 'Error al cargar estadísticas' };
        }
    } catch (error) {
        console.error('Get feedback stats error:', error);
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
// Recursos Functions (Admin)
// ==========================================
async function loadRecursos(params = {}) {
    try {
        const query = new URLSearchParams();
        if (params.tipo) query.append('tipo', params.tipo);
        if (params.categoria) query.append('categoria', params.categoria);
        if (params.page) query.append('page', params.page);
        if (params.limit) query.append('limit', params.limit);

        const response = await fetch(`${API_BASE_URL}/recursos?${query.toString()}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true, recursos: data.data.recursos, pagination: data.data.pagination };
        }
        return { success: false, error: data.message || 'Error al cargar recursos' };
    } catch (error) {
        console.error('Load recursos error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getRecurso(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/recursos/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true, recurso: data.data };
        }
        return { success: false, error: data.message || 'Error al cargar recurso' };
    } catch (error) {
        console.error('Get recurso error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function createRecurso(recursoData) {
    try {
        const response = await fetch(`${API_BASE_URL}/recursos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(recursoData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true, recurso: data.data };
        }
        return { success: false, error: data.message || 'Error al crear recurso' };
    } catch (error) {
        console.error('Create recurso error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function updateRecurso(id, recursoData) {
    try {
        const response = await fetch(`${API_BASE_URL}/recursos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(recursoData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true, recurso: data.data };
        }
        return { success: false, error: data.message || 'Error al actualizar recurso' };
    } catch (error) {
        console.error('Update recurso error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function deleteRecurso(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/recursos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true };
        }
        return { success: false, error: data.message || 'Error al eliminar recurso' };
    } catch (error) {
        console.error('Delete recurso error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function uploadPDF(file) {
    try {
        // Convertir archivo a base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const response = await fetch(`${API_BASE_URL}/recursos/upload-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ pdfBase64: base64 })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return { success: true, text: data.data.text, pages: data.data.pages };
        }
        return { success: false, error: data.message || 'Error al subir PDF' };
    } catch (error) {
        console.error('Upload PDF error:', error);
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
    updateConversationCategory,
    deleteConversation,
    searchConversations,
    rateConversation,
    
    // Feedback
    saveFeedback,
    getConversationFeedback,
    getFeedbackStats,
    
    // Admin
    loadUsers,
    getAnalytics,
    
    // Recursos
    loadRecursos,
    getRecurso,
    createRecurso,
    updateRecurso,
    deleteRecurso,
    uploadPDF,
    
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
