'use strict';

const Mailchimp = require('mailchimp-api-v3');

/**
 * Subscribe an email to the list.
 * Return a promise.
 *
 * @param {string} email the email to subscribe.
 * @param {string} listId the list to subscribe the email to.
 */
function signUpEmail(email, listId) {
    const mailchimp = new Mailchimp(process.env.MC_API_KEY);
    return mailchimp.post(`/lists/${listId}/members`, {
        email_address : email,
        status : 'subscribed'
    });
}

/**
 * Validate that expected environment variables are set.
 */
function validateEnvironment() {
    if (!process.env.hasOwnProperty('MC_API_KEY')) {
        return 'MC_API_KEY not set.';
    }

    if (!process.env.hasOwnProperty('MC_DEFAULT_LIST_ID')) {
        return 'MC_DEFAULT_LIST_ID not set.';
    }

    return false;
}

exports.handler = (event, context, callback) => {
    const done = (err, res) => callback(null, {
        statusCode: '200',
        body: {
            data: err ? false : JSON.stringify(res),
            error: err ? err : false
        },
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const envErr = validateEnvironment();
    if (envErr) {
        console.log(envErr);
        done('server');
    }

    const body = JSON.parse(event.body);
    if (!body.hasOwnProperty('email')) {
        done('email');
    }

    const listid = (body.hasOwnProperty('listid')) ? body.listid : process.env.MC_DEFAULT_LIST_ID;

    signUpEmail(body.email, listid)
    .then(() => {
        done('success');
    })
    .catch((err) => {
        switch (err.status) {
            case 404:
                console.log(`List ID: ${listid} could not be found.`);
                done('server');
                break;
            case 400:
                if (err.title === 'Member Exists') {
                    done('exists');
                } else {
                    console.log(err.detail);
                    done('server');
                }
                break;
            default:
                console.log(err.detail);
                done('server');
        }
    });
};
