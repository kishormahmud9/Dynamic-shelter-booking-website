// API configuration and helper functions

// Base API URL - Update this with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Ensure API_BASE_URL doesn't have trailing slash
const getApiBaseUrl = () => {
    const url = API_BASE_URL.trim()
    return url.endsWith('/') ? url.slice(0, -1) : url
}

/**
 * Get access token from localStorage
 */
const getAccessToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} True if refresh successful, false otherwise
 */
async function refreshAccessToken() {
    try {
        if (typeof window === 'undefined') return false

        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) return false

        const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        })

        const data = await response.json()

        if (!response.ok || !data.access) {
            return false
        }

        localStorage.setItem('accessToken', data.access)
        return true
    } catch (error) {
        console.error('Token refresh failed:', error)
        return false
    }
}

/**
 * Logout user
 */
export function logout() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')

    window.location.href = '/admin/login'
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch (error) {
        console.error('Failed to parse user data:', error)
        return null
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getAccessToken()
}

/**
 * Parse API error response to extract meaningful error message
 */
function parseApiError(errorData) {
    if (!errorData) return 'An unexpected error occurred'

    if (errorData.message) return errorData.message
    if (errorData.detail) return errorData.detail

    // Handle field-specific errors
    const fieldErrors = []
    for (const [field, errors] of Object.entries(errorData)) {
        if (Array.isArray(errors) && errors.length > 0) {
            fieldErrors.push(`${field}: ${errors.join(', ')}`)
        } else if (typeof errors === 'string') {
            fieldErrors.push(`${field}: ${errors}`)
        }
    }

    if (fieldErrors.length > 0) {
        return fieldErrors.join('. ')
    }

    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        return errorData.non_field_errors.join('. ')
    }

    return 'Request failed'
}

/**
 * Make authenticated API request with automatic token refresh
 */
async function makeRequest(url, options = {}) {
    const accessToken = getAccessToken()

    // Debug: Log API configuration
    if (process.env.NODE_ENV === 'development') {
        console.log('API Request Debug:', {
            url,
            baseUrl: getApiBaseUrl(),
            hasAccessToken: !!accessToken,
            method: options.method || 'GET',
            isFormData: options.body instanceof FormData
        })
    }

    const config = {
        ...options,
        headers: {
            ...options.headers,
        },
    }

    // Add authorization header if token exists
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    // Handle FormData vs JSON body
    if (options.body instanceof FormData) {
        // For FormData, let the browser set Content-Type with boundary
        // Explicitly remove Content-Type if it was set, so browser can set it correctly
        delete config.headers['Content-Type']
    } else {
        // Set Content-Type for JSON requests
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json'
        }

        // Convert body to JSON if it's an object
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body)
        }
    }

    try {
        let response = await fetch(url, config)

        // Handle token expiration - try to refresh and retry
        if (response.status === 401 && accessToken) {
            const refreshed = await refreshAccessToken()
            if (refreshed) {
                // Retry with new token
                config.headers['Authorization'] = `Bearer ${getAccessToken()}`
                response = await fetch(url, config)
            } else {
                logout()
                throw new Error('Session expired. Please login again.')
            }
        }

        // Parse response
        let data
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json()
            } catch (jsonError) {
                const text = await response.text()
                throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`)
            }
        } else {
            const text = await response.text()
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
                throw new Error(`Server returned HTML instead of JSON. Status: ${response.status} ${response.statusText}`)
            }
            data = text || null
        }

        if (!response.ok) {
            const errorMessage = parseApiError(data)
            throw new Error(errorMessage)
        }

        return data
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const baseUrl = getApiBaseUrl()
            const errorMsg = `Network error: Unable to connect to ${url}. `
            const suggestions = [
                'Check your internet connection',
                'Verify the backend server is running',
                'Check CORS settings on the backend',
                baseUrl ? `API Base URL: ${baseUrl}` : 'API Base URL is not configured. Set NEXT_PUBLIC_API_URL environment variable.'
            ]
            throw new Error(errorMsg + suggestions.join('. '))
        }
        throw error
    }
}

/**
 * Method 1: GET - Fetch data from API
 * @param {string} endpoint - API endpoint (e.g., '/api/program/programs/')
 * @param {object} params - Query parameters (optional)
 * @returns {Promise} Response data
 */
export async function get(endpoint, params = {}) {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
    }

    // Ensure endpoint starts with / and baseUrl doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = `${baseUrl}${cleanEndpoint}`

    // Add query parameters
    if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params)
        url += `?${searchParams.toString()}`
    }

    return await makeRequest(url, {
        method: 'GET',
    })
}

/**
 * Method 2: POST - Create new resource
 * @param {string} endpoint - API endpoint (e.g., '/api/program/programs/')
 * @param {object|FormData} data - Data to send (object or FormData)
 * @returns {Promise} Created resource
 */
export async function create(endpoint, data = {}) {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
    }

    // Ensure endpoint starts with / and baseUrl doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`

    return await makeRequest(url, {
        method: 'POST',
        body: data,
    })
}

/**
 * Method 3: PUT - Update entire resource
 * @param {string} endpoint - API endpoint (e.g., '/api/program/programs/1/')
 * @param {object|FormData} data - Data to update (object or FormData)
 * @returns {Promise} Updated resource
 */
export async function update(endpoint, data = {}) {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
    }

    // Ensure endpoint starts with / and baseUrl doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`

    return await makeRequest(url, {
        method: 'PUT',
        body: data,
    })
}

/**
 * Method 4: PATCH - Partially update resource
 * @param {string} endpoint - API endpoint (e.g., '/api/program/programs/1/')
 * @param {object|FormData} data - Partial data to update (object or FormData)
 * @returns {Promise} Updated resource
 */
export async function patch(endpoint, data = {}) {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
    }

    // Ensure endpoint starts with / and baseUrl doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`

    return await makeRequest(url, {
        method: 'PATCH',
        body: data,
    })
}

/**
 * Method 5: DELETE - Delete resource
 * @param {string} endpoint - API endpoint (e.g., '/api/program/programs/1/')
 * @returns {Promise} Delete response
 */
export async function del(endpoint) {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
    }

    // Ensure endpoint starts with / and baseUrl doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`

    return await makeRequest(url, {
        method: 'DELETE',
    })
}

// ============================================================================
// Legacy functions for backward compatibility (can be removed later)
// ============================================================================

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Login response with user and tokens
 */
export async function login(email, password) {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Login failed')
    }

    // Store tokens and user data
    if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.access)
        localStorage.setItem('refreshToken', data.tokens.refresh)
    }

    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
}
