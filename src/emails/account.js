const mailgun = require('mailgun-js')

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.DOMAIN;

const mg = mailgun({ apiKey, domain })

const sendWelcomeEmail = (email, name) => {
    const data = {
        from: 'danny@' + domain,
        // to: 'danielekdawy@gmail.com', // if we change this we gotta verify it first 3shan its a free version service
        to: email,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    }
 
    mg.messages().send(data, (error, body) => {
        console.log(body)
    })       
}

const sendCancelationEmail = (email, name) => {
    const data = {
        from: 'danny@sandbox53eaf7974c7d4a2484331e97dddd5113.mailgun.org',
        // to: 'danielekdawy@gmail.com', // if we change this we gotta verify it first 3shan its a free version service
        to: email,
        subject: 'We\'re sad you\'re leaving :(',
        text: `Before you go, ${name}. Let us know what went wrong with the app.`
    }

    mg.messages().send(data, (error, body) => {
        console.log(body)
    })       
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}