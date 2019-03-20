<template>
  <div class="container pt-3">
    <div class="config row">
      <div class="col-6 offset-3">
        <h3 class="text-center">Config</h3>
        <b-form>
          <b-form-group label="Name" label-for="config-name">
            <b-form-input id="config-name" type="text" v-model="user.name" :disabled="true"></b-form-input>
          </b-form-group>
          <b-form-group label="Fee %" label-for="config-fee-percent">
            <b-form-input id="config-fee-percent" type="number" v-model="user.fee_percent" :disabled="true"></b-form-input>
          </b-form-group>
          <b-form-group label="Tezos RPC address" label-for="config-tezos-rpc-address">
            <b-form-input id="config-tezos-rpc-address" type="text" v-model="user.tezos_rpc_address" :disabled="true"></b-form-input>
          </b-form-group>
          <b-form-group label="Baker Tz address" label-for="config-baker-tz-address">
            <b-form-input id="config-baker-tz-address" type="text" v-model="user.baker_tz_address" :disabled="true"></b-form-input>
          </b-form-group>
          <b-form-group class="text-center">
          </b-form-group>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      user: state => state.user
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
