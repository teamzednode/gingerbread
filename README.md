# gingerbread
Dashboard for Tezos Bakers
Demo version at: https://gingerbread.zednode.com

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/teamzednode/gingerbread)
NOTE: This will deploy with sample Zednode configuration, please fork and update `src/static/config.json` with your own delegate address and fees.

## Getting started
Gingerbread is a [Vue](https://vuejs.org/) based dashbaord application to assist bakers with their baking operations. The bare minimum dependendecies to get this running are:
1. Tezos Node running with RPC enabled
2. Static Gingerbread HTML/JS/CSS application hosted

For a more detailed explanation of how gingerbread interacts with the Tezos RPC, please see documentation here: https://github.com/teamzednode/gingerbread/blob/master/rpc_documentation.md

### Running a tezos node
1. Head over [here](https://tezos.gitlab.io/mainnet/introduction/howtoget.html) and follow instructions and either use docker or build from sources. We have successfully built on Ubuntu 18.04.
2. Install SSL certificates, we reccomend Let's Encrypt Certbot: https://certbot.eff.org/
3. Start node with correct parameters: `sudo ./tezos-node run --rpc-addr=0.0.0.0:443 --cors-header='content-type' --cors-origin='*' --rpc-tls="/etc/letsencrypt/live/tezos-mainnet-rpc.zednode.com/fullchain.pem,/etc/letsencrypt/live/tezos-mainnet-rpc.zednode.com/privkey.pem"`

### Running Gingerbread Application
1. Execute `npm run build`. Assets will now be located in `/dist` directory.
2. Start web server from /dist directory. See above for easy deploy via [Netlify](https://www.netlify.com/).

## Build Commands
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
