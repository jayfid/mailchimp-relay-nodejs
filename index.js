'use strict';

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const Mailchimp = require('mailchimp-api-v3');

console.log('starting function.');

exports.handler = (event, context, callback) => {
    const done = (err, res) => {
        const body = {
            data: err ? false : JSON.stringify(res),
            error: err ? err : false
        };
        return callback(null, {
            statusCode: '200',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    };

    /**
     * Validate that expected environment variables are set.
     */
    const validateEnvironment = () => {
        if (!process.env.hasOwnProperty('MC_API_KEY')) {
            return 'MC_API_KEY not set.';
        }

        if (!process.env.hasOwnProperty('MC_DEFAULT_LIST_ID')) {
            return 'MC_DEFAULT_LIST_ID not set.';
        }

        return false;
    };

    /**
     * Subscribe an email to the list.
     * Return a promise.
     *
     * @param {string} email the email to subscribe.
     * @param {string} listId the list to subscribe the email to.
     */
    const signUpEmail = (email, listId) => {
        console.log('signing up');
        const mailchimp = new Mailchimp(process.env.MC_API_KEY);
        console.log('created mailchimp object');
        return mailchimp.post(`/lists/${listId}/members`, {
            email_address : email,
            status : 'subscribed'
        });
    };


    console.log('validating environment');
    const envErr = validateEnvironment();
    if (envErr) {
        console.log(envErr);
        return done('server');
    }
    console.log('environment passes validation');
    const body = JSON.parse(event.body);
    if (!body.hasOwnProperty('email')) {
        return done('email');
    }
    console.log('body has email');
    const listid = (body.hasOwnProperty('listid')) ? body.listid : process.env.MC_DEFAULT_LIST_ID;

    signUpEmail(body.email, listid)
    .then(() => {
        console.log('success');
        return done('success');
    })
    .catch((err) => {
        console.log('error...');
        switch (err.status) {
            case 404:
                console.log(`List ID: ${listid} could not be found.`);
                return done('server');
            case 400:
                if (err.title === 'Member Exists') {
                    return done('exists');
                } else {
                    console.log(err.detail);
                    return done('server');
                }
            default:
                console.log(err.detail);
                return done('server');
        }
    });
};
