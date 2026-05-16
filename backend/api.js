// ============================================
// EduVix API Client
// PORT 5000 - JANGAN UBAH!
// ============================================

const EduvixAPI = (() => {
    const API_BASE = 'http://localhost:5000/api'; // ✅ PORT 5000

    return {
        login: async (username, password) => {
            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('eduvix_token', data.token);
                    localStorage.setItem('eduvix_user', JSON.stringify(data.user));
                }
                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        register: async (nama, username, password) => {
            try {
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, username, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('eduvix_token', data.token);
                    localStorage.setItem('eduvix_user', JSON.stringify(data.user));
                }
                return data;
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        },

        logout: () => {
            localStorage.removeItem('eduvix_token');
            localStorage.removeItem('eduvix_user');
            window.location.href = 'login.html';
        },

        getToken: () => {
            return localStorage.getItem('eduvix_token');
        },

        getUser: () => {
            const user = localStorage.getItem('eduvix_user');
            return user ? JSON.parse(user) : null;
        },

        isAuth: () => {
            return !!localStorage.getItem('eduvix_token');
        },

        fetch: async (endpoint, options = {}) => {
            const token = EduvixAPI.getToken();
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    EduvixAPI.logout();
                    throw new Error('Session expired');
                }
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        }
    };
})();

console.log('✅ EduvixAPI loaded - Port 5000');