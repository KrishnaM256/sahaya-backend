class ApiResponse {
  constructor(statusCode, data, token = '', message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.token = token
    this.success = statusCode < 400
  }
}

module.exports = { ApiResponse }
