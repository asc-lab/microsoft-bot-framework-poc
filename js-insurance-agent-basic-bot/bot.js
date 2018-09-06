// Load the environment variables from the .env file
require('dotenv-extended').load();

const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const InsuranceType = {
    Driver: 'Driver',
    Home: 'Home',
    Farm: 'Farm',
    Travel: 'Travel'
};

const backend = require('./backend');

const inMemoryStorage = new builder.MemoryBotStorage();

const bot = module.exports = new builder.UniversalBot(connector, [
    function (session) {
        builder.Prompts.choice(
            session,
            'What kind of insurance do you need?',
            [InsuranceType.Driver, InsuranceType.Home, InsuranceType.Farm, InsuranceType.Travel],
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
        const selection = result.response.entity;
        switch (selection) {
            case InsuranceType.Driver:
                return session.beginDialog('insurance-driver');
            case InsuranceType.Home:
                return session.beginDialog('insurance-home');
            case InsuranceType.Farm:
                return session.beginDialog('insurance-farm');
            case InsuranceType.Travel:
                return session.beginDialog('insurance-travel');
        }
    }
]).set('storage', inMemoryStorage); // Register in memory storage

function getDriverDialogSteps() {
    return [
        function (session) {
            session.send("OK, lets talk about driver insurance.");
            builder.Prompts.time(session, 'When do you want the insurance coverage to start?');
        },
        function (session, results, next) {
            session.dialogData.policyStart = results.response.resolution.start;
            next();
        },
        function (session) {
            builder.Prompts.time(session, 'When do you want the insurance coverage to end?');
        },
        function (session, results, next) {
            session.dialogData.policyEnd = results.response.resolution.start;
            next();
        },
        function (session) {
            session.send("One more question:");
            builder.Prompts.number(session, 'How many claims did you have in last 5 years?');
        },
        function (session, results, next) {
            session.dialogData.claimsNo = results.response;
            next();
        },
        function (session) {
            session.send("Let wrap up: you need driver insurance from %s to %s and you declared %s claim(s) during last 5 years",
                session.dialogData.policyStart,
                session.dialogData.policyEnd,
                session.dialogData.claimsNo);

            session.send("Calculating price. Please wait...");

            var params = {
                "productCode": "CAR",
                "policyFrom": session.dialogData.policyStart,
                "policyTo": session.dialogData.policyEnd,
                "selectedCovers": ["C1"],
                "answers": [{"questionCode": "NUM_OF_CLAIM", "type": "numeric", "answer": session.dialogData.claimsNo}]
            };

            backend.calculatePrice(params).then(function (offer) {
                session.send("Your insurance will cost %s EUR. Offer ID: %s", offer.totalPrice, offer.offerNumber);
                session.conversationData.offer = offer;
                builder.Prompts.choice(
                    session,
                    'Are you interested?',
                    ['Yes', 'No']
                );
            });

        },
        function (session, result, next) {
            var selection = result.response.entity;
            switch (selection) {
                case 'Yes':
                    session.beginDialog('create-policy');
                    break;
                case 'No':
                    session.send('Bye, then!');
                    session.endDialog();
                    break;
            }
        }
    ];
}

bot.dialog('insurance-driver', getDriverDialogSteps());


bot.dialog('create-policy', [
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
    function (session, results, next) {
        session.userData.taxId = results.response;
        session.send('OK, I am creating policy for %s %s (tax id: %s), please wait...',
            session.userData.firstName,
            session.userData.lastName,
            session.userData.taxId
        );
        var params = {
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
            session.endDialog();
        });
    }
]);

function getHomeDialogSteps() {
    return [
        function (session) {
            session.send("I'm sorry, home insurance is not supported yet.");
            session.endDialog();
        }
    ];
}

bot.dialog('insurance-home', getHomeDialogSteps());

function getFarmDialogSteps() {
    return [
        function (session) {
            session.send("I'm sorry, farm insurance is not supported yet.");
            session.endDialog();
        }
    ];
}

bot.dialog('insurance-farm', getFarmDialogSteps());

function getTravelDialogSteps() {
    return [
        function (session) {
            session.send("I'm sorry, travel insurance is not supported yet.");
            session.endDialog();
        }
    ];
}

bot.dialog('insurance-travel', getTravelDialogSteps());

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error occurred', e);
});
