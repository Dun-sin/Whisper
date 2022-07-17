import axios from "axios"

const getServerUrl = () => {
    // Don't know url to server yet!
    return process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 4000}` : process.env.PRODUCTION_SERVER_URL ?? ''
}

const api = axios.create({
    baseURL: getServerUrl(),
    headers: {
        Accept: 'application/json'
    }
})

api.interceptors.request.use(
    async (config) => {
        config.headers['Content-Type'] = config.data instanceof FormData ? 'multipart/form-data' : 'application/json'
        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Request went through; Not a network error
        if (error.response) {
            /**
             * TODO: Handle response codes from server
             */
        } else {
            // Request failed due to a network error; Request didn't reach server
        }

        return Promise.reject(error);
    }
)

export { getServerUrl, api }

