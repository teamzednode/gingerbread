<template>
  <div class="config row">
    <div class="col-md-12">
      <b-form>
        <b-form-group label="Name" label-for="config-name">
          <b-form-input id="config-name" type="text" v-model="form.name" :disabled="true"></b-form-input>
        </b-form-group>
        <b-form-group label="Fee %" label-for="config-fee-percent">
          <b-form-input id="config-fee-percent" type="number" v-model="form.fee_percent" :disabled="true"></b-form-input>
        </b-form-group>
        <b-form-group label="Minimum contribution" label-for="config-minimum-contribution">
          <b-form-input id="config-minimum-contribution" type="number" v-model="form.minimum_contribution" :disabled="true"></b-form-input>
        </b-form-group>
        <b-form-group label="Tezos RPC address" label-for="config-tezos-rpc-address">
          <b-form-input id="config-tezos-rpc-address" type="text" v-model="form.tezos_rpc_address" :disabled="true"></b-form-input>
        </b-form-group>
        <b-form-group label="Baker Tz address" label-for="config-baker-tz-address">
          <b-form-input id="config-baker-tz-address" type="text" v-model="form.baker_tz_address" :disabled="true"></b-form-input>
        </b-form-group>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      form: {
        name: null,
        fee_percent: null,
        minimum_contribution: null,
        tezos_rpc_address: null,
        baker_tz_address: null
      }
    }
  },
  created () {
    this.loadConfig()
  },
  methods: {
    loadDefaultConfig () {
      console.log('No /static/config.json found; using default config.')
      this.form = {
        name: 'foo',
        fee_percent: 5,
        minimum_contribution: 3,
        tezos_rpc_address: 'asdf',
        baker_tz_address: 'asdf'
      }
    },
    loadConfig () {
      fetch('/static/config.json')
        .then((resp) => {
          if (resp.ok) resp.json().then((j) => { this.form = j })
          else this.loadDefaultConfig()
        })
        .catch(() => {
          this.loadDefaultConfig()
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
