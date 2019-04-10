# gingerbread
Dashboard for Tezos Bakers
Demo version at: https://gingerbread.zednode.com

![image](https://user-images.githubusercontent.com/2114180/54505261-61b54300-48f4-11e9-9aac-8e9c8b3addf2.png)

![image](https://user-images.githubusercontent.com/2114180/54505304-87dae300-48f4-11e9-8de2-732e7d3b8286.png)

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
1. Fork project and update `static/config.json`. `static/example.config.json` provides an example of all the required fields needed.
2. Execute `npm run build`. Assets will now be located in `/dist` directory.
2. Start web server from /dist directory. See above for easy deploy via [Netlify](https://www.netlify.com/).

#### Bootstrap Data
##### First time running
1. `cd scripts`
2. `node -r esm saveSnapshotNumberToJson.js`
3. `node -r esm saveAllData.js`

##### hourly job to keep data updated
1. `cd scripts`
2. `node -r esm hourlySaveToJson.js`


### Batch payouts to delegators
1. Navigate to cycle you would like to pay out delegators for.(e.g. /cycle_info/83)
2. Click Transactions Download button and save transactions to your local file system.
3. Download `tezos-batch-payments` bash script from https://github.com/figment-networks/tezos-batch-payments. NOTE: we have tested this MD5 version `df8b37f3255d8923143eb680cf154720`. You can run `md5 tezos-batch-payments.bash` to check. PLEASE USE SCRIPT AT YOUR OWN RISK.
4. Make sure your `tezos-client` locally is configured properly, here is what our `~/.tezos-client/config` looks like:
```json
{ "base_dir": "/Users/zednode/.tezos-client", "node_addr": "tezos-mainnet-rpc.zednode.com",
  "node_port": 443, "tls": true, "web_port": 8080, "confirmations": 0 }
 ```
5. Create a "float" account. This account is only funded and used for payouts. `tezos-client gen keys float`
6. Reveal account: `tezos-client reveal key for float`
7. Call batch payout script and specify your float address and transactions file. `./tezos-batch-payments.bash --use float --transactions-file ~/transactions/transactions_cycle_50.txt

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

## License
MIT License

Copyright (c) 2019 Zednode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
