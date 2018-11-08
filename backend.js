require('dotenv-extended').load();
const request = require('request');
const backendHost = process.env.BACKEND_HOST;
const authHost = process.env.AUTH_HOST;

function login() {
    const credentials = {"username": "jimmy.solid", "password": "secret"};

    return new Promise(function (resolve, reject) {
        request({
                method: 'POST',
                uri: `${authHost}/login`,
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
                uri: `${backendHost}/api/offers`,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.access_token
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
                uri: `${backendHost}/api/policies/create`,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.access_token
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
                uri: `${backendHost}/api/products/` + params.code,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.access_token
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

function _getPolicyAttachments(code, auth) {
    return new Promise(function (resolve, reject) {
        request({
                method: 'GET',
                uri: `${backendHost}/api/documents/` + code,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + auth.access_token
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

function getPolicyAttachments(code) {
    return login()
        .then(function (auth) {
            return _getPolicyAttachments(code, auth);
        });
}

module.exports = {
    calculatePrice: calculatePrice,
    createPolicy: createPolicy,
    getProductDefinition: getProductDefinition,
    getPolicyAttachments: getPolicyAttachments
};
