const SERVER_URL = process.env.NODE_ENV === 'production' ? 'http://server.wetube.club' : 'http://localhost:8080';
const PUBLIC_URL = process.env.NODE_ENV === 'production' ? 'http://wetube.club' : 'http://localhost:3000';

export { SERVER_URL, PUBLIC_URL };
