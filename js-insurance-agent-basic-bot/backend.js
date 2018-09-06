const request = require('request');

function login() {
    const credentials = {"username": "", "password": ""};

    return new Promise(function (resolve, reject) {
        request({
                method: 'POST',
                uri: 'http://localhost:8090/login',
                headers: {
                    'content-type':
                        'application/json'
                },
                body:
                    JSON.stringify(credentials)

            },
            function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            }
        );
    });
}

function getPrice(params, auth) {
    return new Promise(function (resolve, reject) {
        request({
                method: 'POST',
                uri: 'http://localhost:8081/api/offers',
                headers: {
                    'content-type':
                        'application/json',
                    'Authorization': 'Bearer ' + auth.accessToken
                },
                body:
                    JSON.stringify(params)

            },
            function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            }
        );
    });
}

function calculatePrice(params) {
    return login()
        .then(function (auth) {
            return getPrice(params, auth);
        });
}

module.exports = {
    calculatePrice: calculatePrice
};