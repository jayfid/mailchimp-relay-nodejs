# Mailchimp Relay
Simple endpoint to accept an **email** and optional **listid**. This attempts to subscribe the email to said list, returning a limited JSON response.

## Request
Accepts POST requests including the fields:
- email, containing a valid email.
- listid, *optional* api id of the email list. __If omitted, defaults to list id set in config.__

## Data
Format is as follows
```
{
    data: "false" on error | "subscribed" on success,
    error: "false" on success | "exists" if already subscribed | "email" if email is invalid | "server" for other errors
}
```

## Requirements
Assumed to be running on aws lambda, fronted by the API gateway.

## Install
Set the following variables
- `MC_API_KEY` - Your mailchimp api key
- `MC_DEFAULT_LIST_ID` - The id of the default list.
