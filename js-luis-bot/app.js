const {BotFrameworkAdapter, MemoryStorage, ConversationState} = require('botbuilder');
const {LuisRecognizer} = require('botbuilder-ai');
const restify = require('restify');
require('dotenv').config();

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Create LUIS recognizer
const luisRecognizer = new LuisRecognizer({
    appId: process.env.LUIS_APP_ID,
    subscriptionKey: process.env.LUIS_SUBSCRIPTION_KEY,
    serviceEndpoint: process.env.LUIS_MODEL_URL,
    verbose: true
});
adapter.use(luisRecognizer);

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

//const dialogs = new DialogSet();

// Listen for incoming activity
server.post('/api/messages', (req, res) => {
    // Route received activity to adapter for processing
    adapter.processActivity(req, res, async (context) => {
            if (context.activity.type === 'message') {
                const utterance = context.activity.text;

                // Check topic flags in conversation state
                if (conversationState.weatherTopicStarted) {
                    // Assume the user's message is a reply to the bot's prompt for a location
                    await context.sendActivity(`The weather in ${utterance} is sunny.`);
                    // This conversation flow is now finished. Set flag to false,
                    // so that on the next turn the user can ask for another weather forecast.
                    conversationState.WeatherTopicStarted = false;
                }
                // To add more steps to the other topics
                // you could check the topic flags here
                else {
                    const results = luisRecognizer.get(context);

                    console.log('\n------- RESPONSE FROM LUIS --------');
                    console.log(results);
                    console.log('------- RESPONSE FROM LUIS --------\n');

                    const topIntent = LuisRecognizer.topIntent(results);
                    switch (topIntent) {
                        case 'None':
                            //Add app logic when there is no result
                            await context.sendActivity("<null case>");
                            break;
                        case 'Cancel':
                            conversationState.cancelTopicStarted = true;
                            await context.sendActivity("<cancelling the process>");
                            break;
                        case 'Help':
                            conversationState.helpTopicStarted = true;
                            await context.sendActivity("<here's some help>");
                            break;
                        case 'Weather':
                            conversationState.weatherTopicStarted = true;
                            await context.sendActivity("Looks like you want a weather forecast. What city do you want the forecast for?");
                            break;
                        default:
                            await context.sendActivity(`Received this intent: ${topIntent}`);
                    }
                }
            } else if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name === 'Bot') {
                await context.sendActivity(`Hi! I'm a simple bot.`);
            } else {
            }
        }
    );
});