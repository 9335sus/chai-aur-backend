class ApiResponse {
    /**
     * ApiResponse class API responses ko standard format me banane ke liye use hoti hai.
     * 
     * @param {number} statusCode - HTTP status code (200, 404, 500 etc.)
     * @param {*} data - Response me bheja jane wala data (object, array, string, etc.)
     * @param {string} message - Success ya error ka message (default "success")
     */
    constructor(statusCode, data, message = "success") {
        this.statusCode = statusCode       // HTTP status code set karte hain
        this.data = data                   // Response data set karte hain
        this.message = message             // Message set karte hain
        this.success = statusCode < 400   // Agar statusCode 400 se kam hai, toh success true hoga, warna false
    }
}

export default ApiResponse;
