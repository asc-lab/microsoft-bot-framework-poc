# Insurance Agent Bot

This bot is used to sell insurance and integrates with our **[LAB Insurance Sales Portal](https://github.com/asc-lab/micronaut-microservices-poc)**.

This bot is build with [**Bot Builder SDK (Microsoft Bot Framework) v3**](https://github.com/Microsoft/BotBuilder).

On **luis** branch is a version that shows how to integrate the bot with [**LUIS.ai service**](https://luis.ai).

Check out our blog if you want to learn more:
- [Our first ChatBot](https://altkomsoftware.pl/en/blog/chatbot/)
- [Our first ChatBot part II](https://altkomsoftware.pl/en/blog/chatbot-luis/)


## Dialog
<p align="center">
    <img alt="Dialog_Line" src="https://raw.githubusercontent.com/asc-lab/chatbot-poc/master/readme_images/chatbot_dialog_line.png" />
</p>

## Prerequisites
* ```.env``` file.
```
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=

MOCK_BACKEND=false
BACKEND_HOST=http://localhost:8091
AUTH_HOST=http://localhost:8090
```
* if you want to have the benefits of full functionality, you must run our **[LAB Insurance Sales Portal](https://github.com/asc-lab/micronaut-microservices-poc)** and change in ```.env``` file ```MOCK_BACKEND``` from ```true``` to ```false```.


## Build
```
npm install
```

## Run
```
npm run start
```
Run [Microsoft Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases), open **insurance-agent-basic-bot.bot** file from this repo in emulator and enjoy.

## Example
<p align="center">
    <img alt="Example" src="https://raw.githubusercontent.com/asc-lab/chatbot-poc/master/readme_images/bot.gif" />
</p>
