require('dotenv').config();

module.exports = {
    apiUrl: process.env.API_URL,
    token: process.env.API_TOKEN,
    businessId: parseInt(process.env.BUSINESS_ID) || 1,
    idMedicoExecutor: parseInt(process.env.ID_MEDICO_EXECUTOR) || 0,

    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: parseInt(process.env.DB_PORT) || 3306
    },

    googleSpreadsheetId: process.env.GOOGLE_SHEET_ID,
    googleSpreadsheetRange: process.env.GOOGLE_SPREADSHEET_RANGE,
    googleServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT,

    features: {
        active: process.env.FEATURES_ACTIVE === 'true',
        data: {
            limiteRegister: parseInt(process.env.FEATURES_LIMITE_REGISTER) || 1
        }
    }
};
