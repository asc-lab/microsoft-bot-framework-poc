require('dotenv-extended').load();

const builder = require('botbuilder');
const backend = require('./backend');
const util = require('util');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const inMemoryStorage = new builder.MemoryBotStorage();
const bot = module.exports = new builder.UniversalBot(connector, getWelcomeSteps()).set('storage', inMemoryStorage);
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

const InsuranceType = {
    Driver: {code: 'CAR', name: 'Driver'},
    Home: {code: 'HSI', name: 'Home'},
    Farm: {code: 'FAI', name: 'Farm'},
    Travel: {code: 'TRI', name: 'Travel'}
};

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error occurred', e);
});


bot.dialog('buy-insurance', getBuyInsuranceSteps()).triggerAction({matches: 'BuyPolicy'});
bot.dialog('register-claim', getRegisterClaimSteps()).triggerAction({matches: 'RegisterClaim'});
bot.dialog('insurance-driver', getDialogSteps(InsuranceType.Driver.code));
bot.dialog('insurance-home', getDialogSteps(InsuranceType.Home.code));
bot.dialog('insurance-farm', getDialogSteps(InsuranceType.Farm.code));
bot.dialog('insurance-travel', getDialogSteps(InsuranceType.Travel.code));
bot.dialog('create-policy', getCreatePolicySteps());

function getWelcomeSteps() {
    return [
        function (session) {
            session.send('Hello in ASC LAB Insurance Agent Bot!');
            session.send('What do you want?');
        }
    ];
}

function getBuyInsuranceSteps() {
    return [
        function (session, result, next) {
            session.send('Great! You want to buy new insurance. We try recognize what insurance do you need...');
            console.log(result);
            let intent = result.intent;
            let insuranceType = builder.EntityRecognizer.findEntity(intent.entities, 'InsuranceType');
            if (!insuranceType) {
                session.send('Unfortunately, you have not written yet what insurance you need.');
                next();
            } else {
                switch (insuranceType.entity) {
                    case 'home':
                        return redirectToProperDialog(session, 'home');
                    case 'travel':
                        return redirectToProperDialog(session, 'travel');
                    case 'farm':
                        return redirectToProperDialog(session, 'farm');
                    case 'car':
                        return redirectToProperDialog(session, 'car');
                    default:
                        session.send('Unfortunately, you have not written yet what insurance you need.');
                        next();
                }
            }
        },
        function (session) {
            builder.Prompts.choice(
                session,
                'What kind of insurance do you need?',
                [InsuranceType.Driver.name, InsuranceType.Home.name, InsuranceType.Farm.name, InsuranceType.Travel.name],
                {
                    maxRetries: 3,
                    retryPrompt: 'Not a valid option'
                });
        },
        function (session, result) {
            if (!result.response) {
                // exhausted attemps and no selection, start over
                session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
                return session.endDialog();
            }

            // on error, start over
            session.on('error', function (err) {
                session.send('Failed with message: %s', err.message);
                session.endDialog();
            });

            // continue on proper dialog
            console.log(result.response.entity);
            const selection = result.response.entity;
            switch (selection) {
                case InsuranceType.Driver.name:
                    return session.beginDialog('insurance-driver');
                case InsuranceType.Home.name:
                    return session.beginDialog('insurance-home');
                case InsuranceType.Farm.name:
                    return session.beginDialog('insurance-farm');
                case InsuranceType.Travel.name:
                    return session.beginDialog('insurance-travel');
            }
        }
    ];
}

function getCreatePolicySteps() {
    return [
        function (session) {
            session.send('OK, lets sign papers!');
            builder.Prompts.text(session, 'What is your first name?');
        },
        function (session, results, next) {
            session.userData.firstName = results.response;
            next();
        },
        function (session) {
            builder.Prompts.text(session, 'What is your last name?');
        },
        function (session, results, next) {
            session.userData.lastName = results.response;
            next();
        },
        function (session) {
            session.send('One more question:');
            builder.Prompts.text(session, 'What is your tax id?');
        },
        function (session, results) {
            session.userData.taxId = results.response;
            session.send('OK, I am creating policy for %s %s (tax id: %s), please wait...',
                session.userData.firstName,
                session.userData.lastName,
                session.userData.taxId
            );
            const params = {
                "offerNumber": session.conversationData.offer.offerNumber,
                "policyHolder": {
                    "firstName": session.userData.firstName,
                    "lastName": session.userData.lastName,
                    "taxId": session.userData.taxId
                }
            };
            backend.createPolicy(params).then(function (policy) {
                console.log(policy);
                session.send('Your policy has been created: %s', policy.policyNumber);
                waitForDocumentCreation()
                    .then(function () {
                        return backend.getPolicyAttachments(policy.policyNumber)
                    })
                    .then(function (response) {
                        console.log("processing attachments ");
                        if (response != null && response.documents != null) {
                            console.log(response.documents);
                            session.send('Below, your documents will appear, which you should download as a confirmation of insurance.');
                            response.documents.forEach(function (doc) {
                                sendInline(session, {
                                        content: doc.content,
                                        contentType: 'application/pdf',
                                        name: 'policy.pdf'
                                    }
                                );
                            });
                        }
                        session.endDialog();
                    });
            });
        }
    ];
}

function waitForDocumentCreation() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

function getDialogSteps(productCode) {
    let steps = [];
    backend.getProductDefinition({
        code: productCode
    }).then(function (product) {
        console.log(product);
        steps = _addStepsAboutCoverageDates(steps);
        steps = _addStepsBasedOnTariff(product, steps);
        steps = _addSummarySteps(steps);
        steps = _addCalculatePriceSteps(product, steps);
    });
    return steps;
}

function _addStepsAboutCoverageDates(steps) {
    steps.push(function (session) {
        session.send("OK, lets talk about insurance.");
        builder.Prompts.time(session, 'When do you want the insurance coverage to start?');
    });

    steps.push(function (session, results, next) {
        session.dialogData.policyStart = results.response.resolution.start;
        next();
    });
    steps.push(function (session) {
        builder.Prompts.time(session, 'When do you want the insurance coverage to end?');
    });
    steps.push(function (session, results, next) {
        session.dialogData.policyEnd = results.response.resolution.start;
        next();
    });
    return steps;
}

function _addStepsBasedOnTariff(product, steps) {
    product.questions.forEach(function (question) {
        if (question.type === 'numeric') {
            steps.push(function (session) {
                builder.Prompts.number(session, question.text);
            });

            steps.push(function (session, results, next) {
                if (!session.dialogData.answers) session.dialogData.answers = [];

                session.dialogData.answers.push({
                    "text": question.text,
                    "questionCode": question.code,
                    "type": question.type,
                    "answer": results.response
                });

                next();
            });
        }

        if (question.type === 'choice') {
            steps.push(function (session) {
                builder.Prompts.choice(session,
                    question.text,
                    question.choices.map(c => c.label),
                    {
                        maxRetries: 3,
                        retryPrompt: 'Not a valid option'
                    });
            });

            steps.push(function (session, results, next) {
                if (!session.dialogData.answers) session.dialogData.answers = [];

                console.log(results.response);
                session.dialogData.answers.push({
                    "text": question.text,
                    "questionCode": question.code,
                    "type": question.type,
                    "answer": question.choices.find(c => c.label === results.response.entity).code
                });
                next();
            });
        }
    });

    return steps;
}

function _addSummarySteps(steps) {
    steps.push(function (session, results, next) {
        session.send("Let wrap up: you need insurance from %s to %s.", session.dialogData.policyStart, session.dialogData.policyEnd);
        session.send("Your answers:");
        session.dialogData.answers.forEach(a => {
            session.send("Question: %s. Answer: %s.", a.text, a.answer);
        });
        next();
    });
    return steps;
}

function _addCalculatePriceSteps(product, steps) {
    steps.push(function (session) {
        session.send("Calculating price. Please wait...");

        const params = {
            "productCode": product.code,
            "policyFrom": session.dialogData.policyStart,
            "policyTo": session.dialogData.policyEnd,
            "selectedCovers": product.covers.map(c => c.code),
            "answers": session.dialogData.answers
        };

        console.log(params);
        backend.calculatePrice(params).then(function (offer) {
            session.send("Your insurance will cost %s EUR. Offer ID: %s", offer.totalPrice, offer.offerNumber);
            session.conversationData.offer = offer;
            builder.Prompts.choice(
                session,
                'Are you interested?',
                ['Yes', 'No']
            );
        });

        steps.push(function (session, result) {
            const selection = result.response.entity;
            switch (selection) {
                case 'Yes':
                    session.beginDialog('create-policy');
                    break;
                case 'No':
                    session.send('Bye, then!');
                    session.endDialog();
                    break;
            }
        });
    });

    return steps;
}

function sendInline(session, document) {
    const msg = new builder.Message(session)
        .addAttachment({
            contentUrl: util.format('data:%s;base64,%s', document.contentType, document.content),
            contentType: document.contentType,
            name: document.name
        });

    session.send(msg);
}

function getRegisterClaimSteps() {
    return [
        function (session) {
            session.send('Unfortunately, currently you can only buy insurance. Sorry :(');
            session.endDialog();
        }
    ];
}

function redirectToProperDialog(session, insuranceName) {
    session.send('Cool! You are interested in buying ' + insuranceName + ' insurance');
    return session.beginDialog('insurance-' + insuranceName);
}