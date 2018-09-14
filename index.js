
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const token = 'test'; // type here your verification token
const request = require('request');




app.get('/', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        return res.sendStatus(401);
    }

    // return challenge
    return res.end(req.query.challenge);
});

app.post('/', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        return res.sendStatus(401);
    }
  
    // print request body
    console.log(JSON.stringify(req.body,null,2));

    var options = {
        method: 'GET',
        uri: 'https://api.zoopla.co.uk/api/v1/property_listings.js',
        qs: {
            api_key: 'kmnafv8nhfm5bxgefezj34y7',
            area: 'london',
            radius: 40
        },
        json: true
    }

    if (req.body.result.parameters) {
        var pars = req.body.result.parameters;
        if (pars.postcode) {
            options.qs.area = pars.postcode;
        }
        if (pars.numberofbeds) {
            options.qs.minimum_beds = pars.numberofbeds;
            options.qs.maximum_beds = pars.numberofbeds;
        }
    }

    console.log('Query string');
    console.log(JSON.stringify(options.qs, null, 2));

    request(options, (err, response, body) => 
    {
        if (err) { 
            const data = {
                responses: [
                    {
                        type: 'text',
                        elements: ['Error',err]
                    }
                ]
            };
            res.json(data);
            return console.log(err);
        }
        console.log('ZOOPLA response');
        console.log(JSON.stringify(body, null, 2));
        // return a text response
        const data = {
            responses: [
                {
                    type: 'text',
                    elements: ['ZOOPLA RESPONSE', 'Properties found']
                },
                {   
                    type: 'text',
                    elements:[body.listing[0].thumbnail_url]    
                }
            ]
        };
        res.json(data);
    });
});

app.listen(3000, () => console.log('[BotEngine] Webhook is listening'));
