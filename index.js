
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
  
    console.log('Chatbot request headers');
    console.log(req.get('zooplaurl'))
    console.log('Chatbot request body')
    console.log(JSON.stringify(req.body,null,2));

    var options = {
        method: 'GET',
        uri: 'https://api.zoopla.co.uk/api/v1/property_listings.js',
        qs: {
            api_key: 'kmnafv8nhfm5bxgefezj34y7',
            area: 'london',
            radius: 5,
            page_size: 5
        },
        json: true
    }

    var pars;

    if (req.body.result.parameters) {
        pars = req.body.result.parameters;
        if (pars.postcode) {
            options.qs.area = pars.postcode;
        }
        if (pars.area) {
            options.qs.area = pars.area;
        }

        if (pars.minprice) {
            options.qs.minimum_price = pars.minprice;
        }

        if (pars.maxprice) {
            options.qs.maximum_price = pars.maxprice;
        }

        if (pars.property_type) {
            options.qs.property_type = pars.property_type;
        }

        if (pars.listing_status) {
            options.qs.listing_status = pars.listing_status;
        }

        if (pars.numberofbeds) {
            options.qs.minimum_beds = pars.numberofbeds;
            options.qs.maximum_beds = pars.numberofbeds;
        }
    }

    if (req.body.result.sessionParameters) {
        pars = req.body.result.sessionParameters;
        if (pars.postcode) {
            options.qs.area = pars.postcode;
        }
        if (pars.area) {
            options.qs.area = pars.area;
        }

        if (pars.minprice) {
            options.qs.minimum_price = pars.minprice;
        }

        if (pars.maxprice) {
            options.qs.maximum_price = pars.maxprice;
        }

        if (pars.property_type) {
            options.qs.property_type = pars.property_type;
        }

        if (pars.listing_status) {
            options.qs.listing_status = pars.listing_status;
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
                        elements: ['ZOOPLA Error',err]
                    }
                ]
            };
            res.json(data);
            return console.log(err);
        }
        console.log('ZOOPLA response');
        console.log(JSON.stringify(body, null, 2));
        // return a text response

        if (!body.listing) {
            const data = {
                responses: [
                    {
                        type: 'text',
                        elements: ['ZOOPLA Error', body.error_string,'Parameters', JSON.stringify(options.qs)]
                    }
                ]
            }
            res.json(data);
            return
        }
        var data;
        if (body.listing.length > 0) {
        
            var propi = 0;
            if (req.body.result.fulfillment) {
                if (req.body.result.fulfillment.length > 1) {
                    propi = 1;
                }
            }

            var cards = {
                type: 'cards',
                elements: [],
                filters: []
            };
            for (let i = propi; i < body.listing.length; i++) {
                const prop = body.listing[i];
                cards.elements.push({
                    title: prop.displayable_address,
                    subtitle: prop.agent_name,
                    imageUrl: prop.image_url,
                    buttons: [
                        {
                            type: 'url',
                            title: 'See on Zoopla',
                            value: prop.details_url
                        }
                    ],
                    filters: []
                });
            }
            var prop = body.listing[propi];

            data = {
                responses: [
                    {
                        type: 'text',
                        elements: ['ZOOPLA RESPONSE', 'Properties found']
                    },
                    {   
                        type: 'card',
                        title: prop.displayable_address,
                        subtitle: prop.agent_name,
                        imageUrl: prop.image_url,
                        buttons: [
                            {
                                type: 'url',
                                title: 'See on Zoopla',
                                value: prop.details_url
                            }
                        ],
                        filters: []
                    }
                ]
            }
        } else {
            data = {
                responses: [
                    {
                        type: 'text',
                        elements: ['ZOOPLA RESPONSE', 'Sorry, No properties found']
                    }
                ]
            }
        }
        console.log('Webhook response');
        console.log(JSON.stringify(data,null,2));
        res.json(data);
    });
});

app.listen(8081, () => console.log('[BotEngine] Webhook is listening'));
