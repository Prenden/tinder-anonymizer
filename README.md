# Tinder Anonymizer

Just a small fun project for late night Twitch streams where we do some fun on Tinder and don't want to abuse privacy of others.

## Current state
- [x] Change real images to given static image
- [x] Hide the descriptions
- [x] Hide the meta data (city, distance, school, job)

## Requirements
Node

## Installation

- Install packages:
```
npm i
```

- Copy `.env.example` and rename it to `.env`.
- Setup your environment:
```
NEW_IMAGE_URL: you should set to the image you would like to preview instead of the real images.
SELECTOR_TIMEOUT_MS: it's a number and after this ms if the given selector is not loaded the software will exit.
```

## Running

- Start it with command:
```
npm start
```
- Login with your account
- When all the images change to the given image start the stream ;)

## Additional safety settings

You can route the Tinder image cloud url requests to your localhost address with editing your hosts file.
In my case (I use MacOs), I have opened Terminal and typed:
```
nano /etc/hosts
```

Then in the end I have added:
```
127.0.0.1 images-ssl.gotinder.com
```

## Future plans

In the future I would like to implement the given checklist if we will keep up the fun:

- [ ] Auto login from environment variables
- [ ] Add deep learned based face blur to blur only the face not swap the whole image
- [ ] Add some easter eggs for given description words
- [ ] Remove only social media account tags not the whole descriptions
