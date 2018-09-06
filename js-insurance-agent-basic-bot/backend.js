const request = require('request');

function login() {
    const credentials = {"username": "jimmy.solid", "password": "secret"};

    return new Promise(function (resolve, reject) {
        request({
                method: 'POST',
                uri: 'http://localhost:8090/login',
                headers: {
                    'content-type': 'application/json'
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
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.accessToken
                },
                body:
                    JSON.stringify(params)

            },
            function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    console.log(body);
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

function _createPolicy(params, auth) {
    return new Promise(function (resolve, reject) {
        request({
                method: 'POST',
                uri: 'http://localhost:8081/api/policies/create',
                headers: {
                    'content-type': 'application/json',
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

function createPolicy(params) {
    return login()
        .then(function (auth) {
            return _createPolicy(params, auth);
        });
}

function _getProductDefinition(params, auth) {
    return new Promise(function (resolve, reject) {
        request({
                method: 'GET',
                uri: 'http://localhost:8081/api/products/' + params.code,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.accessToken
                }
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

function getProductDefinition(params) {
    return login()
        .then(function (auth) {
            return _getProductDefinition(params, auth);
        });
}

module.exports = {
    calculatePrice: calculatePrice,
    createPolicy: createPolicy,
    getProductDefinition: getProductDefinition
};
