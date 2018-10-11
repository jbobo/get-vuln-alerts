#!/usr/bin/env node
// -*- coding: utf-8 -*-

/**
 * Consumes the GitHub v4 GraphQL API to track OSS repos for a given GitHub org
 * ...
 * @author J. Ned Bobo <James.Bobo1@T-Mobile.com>
 * ...
 * 
 */

// <-- IMPORT REMOTE COMPONENTS HERE -->
const requestPromise = require('request-promise');
// <-- GLOBAL / ENVIRONMENT VARIABLES HERE -->
let AUTH_TOKEN = process.env.GITHUB_OAUTH;
const options = {
    "encoding": "utf8",
    "method": "POST",
    "uri": "https://api.github.com/graphql",
    "body": "",
    "json": true, //Automatically stringifies the body to JSON.
    "headers": {
        "Authorization": "token " + AUTH_TOKEN,
        "User-Agent": "~°3°~   OSS Tracker App",
        "Accept": "application/vnd.github.vixen-preview+json",
    },
    "resolveWithFullResponse": true,
    "simple": true,
    "timeout": 120000, //2 min.
};

const main = () => {
    //Initializations.
    const args = process.argv.slice(2);
    const repoWithOwner = args[0];
    const [owner, repo] = repoWithOwner.split('/');
    console.log(`Checking ${repo} for vulnerable dependency alerts.`);
    let requestBody = {};
    requestBody.query = `
    query { 
        repository(owner:"${owner}", name:"${repo}") {
            vulnerabilityAlerts (first:10) {
                nodes {
                    id
                    repository {
                        name
                    }
                }
            }
        }
    }
    `;
    options.body = requestBody;
    const request = () => { return requestPromise(options)
        .then(function(response) {
            const results = response.body.data.repository.vulnerabilityAlerts.nodes;
            return results;
        })
        .catch(function (response) {
            // <-- HANDLE ERRORS HERE -->
            console.log(`Error: ${response}`);
        });
    };

    let httpRequest = request();

    httpRequest.then(function(results) {
        if (results.length > 0) {
            console.log(results);
        } else {
            console.log('No active dependency vulnerability alerts.')
        }
    }).catch(function(err){
        // <-- HANDLE ERRORS HERE -->
        console.log(err);
    });
    return null;
};

if (typeof require !== 'undefined' && require.main === module) {
    main();
};
