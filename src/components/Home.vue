<template>
  <div class="row">
    <div class="col-md-12 pt-2">
      <div class="home">
        <h1>{{ msg }}</h1>
        <p>Please check out <a href="https://github.com/teamzednode/gingerbread">https://github.com/teamzednode/gingerbread</a> for instructions and information on getting started.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Gingerbread!'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
