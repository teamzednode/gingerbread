<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">Gingerbread</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item to="/config">Config</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <main role="main" class="container">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'app',
  created () {
    this.$store.dispatch('user/loadFromConfigFile')
  }
}
</script>

<style>
</style>
