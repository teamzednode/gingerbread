export default class {
  formatTezosNumericalData (data) {
    let formattedValue = this.toTezos(data)
    if (formattedValue > 1000000) {
      return Math.floor((formattedValue / 1000000) * 1000) / 100 + ' Mꜩ'
    } else if (formattedValue > 1000) {
      return Math.floor((formattedValue / 1000) * 100) / 100 + ' Kꜩ'
    } else {
      return formattedValue.toFixed(2) + ' ꜩ'
    }
  }
  toTezos (value) {
    return (parseFloat(parseFloat(value) / 1000000))
  }
}
