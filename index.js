var Alexa = require('alexa-sdk');

exports.handler = async (event, context, callback) => {
    console.log('Executing Lambda ....')
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to AWS Developer Certification!', 'Try saying hello!');
    },
    'NewSession': function () {
        this.emit(':ask', 'Welcome to AWS Developer Certification Skill. Are you ready');
    },   
}