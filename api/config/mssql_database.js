var sql = require('mssql');

var config={
    user: 'qad_reporting',
    password: 'reporting',
    server: '172.16.21.62',
    database: 'WSS_Content',

    options:{
	encrypt: false
    }
};

exports.config=config;
exports.sql=sql;
