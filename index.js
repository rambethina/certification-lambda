// var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
const Alexa = require('ask-sdk');
const _ =require('lodash')

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const skillBuilder = Alexa.SkillBuilders.standard();

const LaunchRequest = {
    canHandle(handlerInput) {
      // launch requests as well as any new session, as games are not saved in progress, which makes
      // no one shots a reasonable idea except for help, and the welcome message provides some help.
      return handlerInput.requestEnvelope.session.new || 
      handlerInput.requestEnvelope.request.type === 'NewSession' ||
      handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
    //   const attributesManager = handlerInput.attributesManager;
      const responseBuilder = handlerInput.responseBuilder;
  
    //   const attributes = await attributesManager.getPersistentAttributes() || {};
    //   if (Object.keys(attributes).length === 0) {
    //     attributes.endedSessionCount = 0;
    //     attributes.gamesPlayed = 0;
    //     attributes.gameState = 'ENDED';
    //   }
  
    //   attributesManager.setSessionAttributes(attributes);
  
      const speechOutput = 'Welcome to AWS Developer Certification Skill. If you are ready say begin';
      const reprompt = 'Say yes to start the game or no to quit.';
      return responseBuilder
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
    },
  };

const FirstQuestion = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        console.log(JSON.stringify(request))
        // launch requests as well as any new session, as games are not saved in progress, which makes
        // no one shots a reasonable idea except for help, and the welcome message provides some help.
        return request.type === 'IntentRequest' && request.intent.name === 'FirstQuestion';
      },
    async handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        var params = {
            TableName: 'certification-questions',
            Key: {'QuestionId': '1'}
       };
       sessionAttributes.currentQuestionNumber = '1'
       attributesManager.setSessionAttributes(sessionAttributes);
       console.log(JSON.stringify(params))
       const results = await docClient.get(params).promise();
       console.log(JSON.stringify(results));
       
    //    const speechOutput = 'SQS is pull based. A <break time="1s"/> True <break time="1s"/>  B <break time="1s"/> False';
    const speechOutput = getQuestionSpeech(results.Item)
       return responseBuilder
         .speak(speechOutput)
         .reprompt('say next')
         .getResponse();
    }
}

const NextQuestion = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        console.log(JSON.stringify(request))
        // launch requests as well as any new session, as games are not saved in progress, which makes
        // no one shots a reasonable idea except for help, and the welcome message provides some help.
        return request.type === 'IntentRequest' && request.intent.name === 'NextQuestion';
      },
    async handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        const nextQuestionNumber = parseInt(sessionAttributes.currentQuestionNumber) +1
        var params = {
            TableName: 'certification-questions',
            Key: {'QuestionId': `${nextQuestionNumber}`}
       };
       sessionAttributes.currentQuestionNumber = `${nextQuestionNumber}`
       attributesManager.setSessionAttributes(sessionAttributes);
       console.log(JSON.stringify(params))
       const results = await docClient.get(params).promise();
       console.log(JSON.stringify(results));
       
    //    const speechOutput = 'SQS is pull based. A <break time="1s"/> True <break time="1s"/>  B <break time="1s"/> False';
    const speechOutput = getQuestionSpeech(results.Item)
       return responseBuilder
         .speak(speechOutput)
         .reprompt('say next')
         .getResponse();
    }
}

const ReplayQuestion = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        // launch requests as well as any new session, as games are not saved in progress, which makes
        // no one shots a reasonable idea except for help, and the welcome message provides some help.
        return request.type === 'IntentRequest' && request.intent.name === 'ReplayQuestion';
      },
    async handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        const currentQuestionNumber = parseInt(sessionAttributes.currentQuestionNumber)
        var params = {
            TableName: 'certification-questions',
            Key: {'QuestionId': `${currentQuestionNumber}`}
       };
       sessionAttributes.currentQuestionNumber = `${currentQuestionNumber}`
       attributesManager.setSessionAttributes(sessionAttributes);
       const results = await docClient.get(params).promise();
       
    const speechOutput = getQuestionSpeech(results.Item)
       return responseBuilder
         .speak(speechOutput)
         .reprompt('say next')
         .getResponse();
    }
}

const AnswerIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        console.log(JSON.stringify(request))
        // launch requests as well as any new session, as games are not saved in progress, which makes
        // no one shots a reasonable idea except for help, and the welcome message provides some help.
        return request.type === 'IntentRequest' && request.intent.name === 'AnswerIntent';
      },
    async handle(handlerInput) {
        var answerList = [];
        const responseBuilder = handlerInput.responseBuilder;
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        var letter = handlerInput.requestEnvelope.request.intent.slots.answerChoice.value;
        var bchoice = handlerInput.requestEnvelope.request.intent.slots.answerChoiceTwo.value;
       console.log(JSON.stringify(sessionAttributes));
       const currentQuestionNumber = sessionAttributes.currentQuestionNumber;
       var params = {
            TableName: 'certification-questions',
            Key: {'QuestionId': currentQuestionNumber}
        };       


       const results = await docClient.get(params).promise();
       console.log(JSON.stringify(results));
       const correctAnswer = results.Item.CorrectAnswer;
       const userChoice = `${letter}`
       answerList.push(userChoice.toUpperCase())
       if (bchoice) {
        answerList.push(`${bchoice}`.toUpperCase())
       }
       const arrayAnswer = _.isEqual(answerList.sort(),correctAnswer.sort())
       console.log(`Correct answer is ${correctAnswer}`);
       console.log(`User choice array is ${answerList}`);
       console.log(`Correct answer is ${correctAnswer.sort()}`);
       console.log(`User choice array is ${answerList.sort()}`);
       console.log(`Final ${arrayAnswer}`);
    //    const reply = correctAnswer.toLowerCase() === userChoice.toLowerCase() ? 'Your Answer is correct' : 'Your answer is wrong';
        const reply = arrayAnswer ? 'Your Answer is correct, you can say next question or replay question' : 'Your answer is wrong, you can say next question or replay question';
       if(arrayAnswer) {
           console.log('Correct answer')
       }else {
        console.log('Wrong answer')
       }
       return responseBuilder
         .speak(reply)
         .reprompt('say next')
         .getResponse();
    }
}

const getQuestionSpeech = item => {
    let questionText = "";
    if(item.ChoiceA) {
        questionText = questionText.concat(`A <break time="500ms"/> ${item.ChoiceA}`)
    } 
    if(item.ChoiceB) {
        questionText = questionText.concat(`<break time="500ms"/> B <break time="500ms"/> ${item.ChoiceB}`)
    }
    if(item.ChoiceC) {
        questionText = questionText.concat(`<break time="500ms"/> C <break time="500ms"/> ${item.ChoiceC}`)
    }
    if(item.ChoiceD) {
        questionText = questionText.concat(`<break time="500ms"/> D <break time="500ms"/> ${item.ChoiceD}`)
    }
    if(item.ChoiceE) {
        questionText = questionText.concat(`<break time="500ms"/> E <break time="500ms"/> ${item.ChoiceE}`)
    }    
    questionText = questionText.concat(`<break time="500ms"/> If you would like me to replay question, say replay question <break time="500ms"/>`)  
    return `${item.Question} <break time="500ms"/> ${questionText}`
}

const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
      console.log(`Type ${handlerInput.requestEnvelope.request.type}`);
      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
  };

  const ExitHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
  
      return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
          || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak('Thanks for taking the quiz!')
        .getResponse();
    },
  };

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequest,
        FirstQuestion,
        AnswerIntent,
        NextQuestion,
        ReplayQuestion,
        ExitHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();