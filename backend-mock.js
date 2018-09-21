function calculatePrice() {
    return new Promise(function (resolve, reject) {
        const isOK = true;
        if (isOK) {
            resolve({"offerNumber":"MOCK_OFFER_NUMBER","totalPrice":1000});
        } else {
            reject({});
        }
    });
}

function createPolicy() {
    return new Promise(function (resolve, reject) {
        const isOK = true;
        if (isOK) {
            resolve({"policyNumber": "MOCK_POLICY_NUMBER"});
        } else {
            reject({});
        }
    });
}

function getProductDefinition() {
    return new Promise(function (resolve, reject) {
        const isOK = true;
        if (isOK) {
            resolve([
                {
                    "code": "CAR",
                    "name": "Happy Driver",
                    "image": "/static/car.jpg",
                    "description": "Car insurance",
                    "covers": [
                        {
                            "code": "C1",
                            "name": "Assistance",
                            "optional": true
                        }
                    ],
                    "questions": [
                        {
                            "type": "numeric",
                            "code": "NUM_OF_CLAIM",
                            "index": 3,
                            "text": "Number of claims in last 5 years"
                        }
                    ],
                    "maxNumberOfInsured": 1
                },
                {
                    "code": "FAI",
                    "name": "Happy farm",
                    "image": "/static/farm.jpg",
                    "description": "Farm insurance",
                    "covers": [
                        {
                            "code": "C1",
                            "name": "Crops",
                            "optional": false,
                            "sumInsured": 200000
                        },
                        {
                            "code": "C2",
                            "name": "Flood",
                            "optional": false,
                            "sumInsured": 100000
                        },
                        {
                            "code": "C3",
                            "name": "Fire",
                            "optional": false,
                            "sumInsured": 50000
                        },
                        {
                            "code": "C4",
                            "name": "Equipment",
                            "optional": true,
                            "sumInsured": 300000
                        }
                    ],
                    "questions": [
                        {
                            "type": "choice",
                            "code": "TYP",
                            "index": 1,
                            "text": "Cultivation type",
                            "choices": [
                                {
                                    "code": "ZB",
                                    "label": "Crop"
                                },
                                {
                                    "code": "KW",
                                    "label": "Vegetable"
                                }
                            ]
                        },
                        {
                            "type": "numeric",
                            "code": "AREA",
                            "index": 2,
                            "text": "Area"
                        },
                        {
                            "type": "numeric",
                            "code": "NUM_OF_CLAIM",
                            "index": 3,
                            "text": "Number of claims in last 5 years"
                        },
                        {
                            "type": "choice",
                            "code": "FLOOD",
                            "index": 4,
                            "text": "Located in flood risk area",
                            "choices": [
                                {
                                    "code": "YES",
                                    "label": "Yes"
                                },
                                {
                                    "code": "NO",
                                    "label": "No"
                                }
                            ]
                        }
                    ],
                    "maxNumberOfInsured": 1
                },
                {
                    "code": "HSI",
                    "name": "Happy House",
                    "image": "/static/house.jpg",
                    "description": "House insurance",
                    "covers": [
                        {
                            "code": "C1",
                            "name": "Fire",
                            "optional": false,
                            "sumInsured": 200000
                        },
                        {
                            "code": "C2",
                            "name": "Flood",
                            "optional": false,
                            "sumInsured": 100000
                        },
                        {
                            "code": "C3",
                            "name": "Theft",
                            "optional": false,
                            "sumInsured": 50000
                        },
                        {
                            "code": "C4",
                            "name": "Assistance",
                            "optional": true
                        }
                    ],
                    "questions": [
                        {
                            "type": "choice",
                            "code": "TYP",
                            "index": 1,
                            "text": "Apartment / House",
                            "choices": [
                                {
                                    "code": "APT",
                                    "label": "Apartment"
                                },
                                {
                                    "code": "HOUSE",
                                    "label": "House"
                                }
                            ]
                        },
                        {
                            "type": "numeric",
                            "code": "AREA",
                            "index": 2,
                            "text": "Area"
                        },
                        {
                            "type": "numeric",
                            "code": "NUM_OF_CLAIM",
                            "index": 3,
                            "text": "Number of claims in last 5 years"
                        },
                        {
                            "type": "choice",
                            "code": "FLOOD",
                            "index": 4,
                            "text": "Located in flood risk area",
                            "choices": [
                                {
                                    "code": "YES",
                                    "label": "Yes"
                                },
                                {
                                    "code": "NO",
                                    "label": "No"
                                }
                            ]
                        }
                    ],
                    "maxNumberOfInsured": 5
                },
                {
                    "code": "TRI",
                    "name": "Safe Traveller",
                    "image": "/static/travel.jpg",
                    "description": "Travel insurance",
                    "covers": [
                        {
                            "code": "C1",
                            "name": "Luggage",
                            "optional": false,
                            "sumInsured": 5000
                        },
                        {
                            "code": "C2",
                            "name": "Illness",
                            "optional": false,
                            "sumInsured": 5000
                        },
                        {
                            "code": "C3",
                            "name": "Assistance",
                            "optional": true
                        }
                    ],
                    "questions": [
                        {
                            "type": "choice",
                            "code": "DESTINATION",
                            "index": 1,
                            "text": "Destination",
                            "choices": [
                                {
                                    "code": "EUR",
                                    "label": "Europe"
                                },
                                {
                                    "code": "WORLD",
                                    "label": "World"
                                },
                                {
                                    "code": "PL",
                                    "label": "Poland"
                                }
                            ]
                        },
                        {
                            "type": "numeric",
                            "code": "NUM_OF_ADULTS",
                            "index": 2,
                            "text": "Number of adults"
                        },
                        {
                            "type": "numeric",
                            "code": "NUM_OF_CHILDREN",
                            "index": 3,
                            "text": "Number of children"
                        }
                    ],
                    "maxNumberOfInsured": 10
                }
            ]);
        } else {
            reject({});
        }
    });
}

function getPolicyAttachments() {
    return new Promise(function (resolve, reject) {
        const isOK = true;
        if (isOK) {
            resolve({});
        } else {
            reject({});
        }
    });
}

module.exports = {
    calculatePrice: calculatePrice,
    createPolicy: createPolicy,
    getProductDefinition: getProductDefinition,
    getPolicyAttachments: getPolicyAttachments
};