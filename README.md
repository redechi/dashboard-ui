# Automatic Dashboard

This repo powers [dashboard.automatic.com](https://dashboard.automatic.com) as well as [Automatic Labs](https://dashboard.automatic.com/#/labs).

It is built with React and React Router.

Automatic Labs is static HTML/CSS/JS.

This project is based on [Automatic Static](https://github.com/Automatic/Automatic-static).

## Setup

    make setup

## Linting and testing

    make lint
    make test

## Running locally

    make run

To watch for changes, run

    make watch

Open localhost:5000 in your browser

To effectively log in when running locally, set a `localStorage` key `accessToken` to a valid access token. You can get a valid access token by logging into the production version of https://dashboard.automatic.com and retrieving the localStorage value of `accessToken`.

In the console:

    // Get an access token
    localStorage.getItem('accessToken')

    // Set an access token
    localStorage.setitem('accessToken', '1234YOURACCESSTOKEN')

## Building

    make build

## Labs

Labs are completely separate from the rest of Dashboard, and don't have any dependencies from the react dashboard app.

Labs files are completely located inside of `static/labs` and don't require anything outside of it. The one exception is `static/data` which is the only place we can put JSON files so they'll be properly gzipped when deployed.

The page that lists all of the labs at [dashboard.automatic.com/#/labs](https://dashboard.automatic.com/#/labs) is part of the dashboard React app.

### Staging

The staging server is visible at https://dashboard.automatic.co

### Deploying

When a commit is added to the master branch on github, it is automatically deployed to staging via Jenkins `Dashboard2-CI` job.

To deploy to production, find the build number of the staging build you want to deploy from the `Dashboard2-CI` job, such as `69120`. Then, enter that build number as a parameter in the `Deploy-Dashboard2` Jenkins job.
