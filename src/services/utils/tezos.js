export default class {
  formatTezosNumericalData (data) {
    let formattedValue = (parseFloat(parseFloat(data) / 1000000))
    if (formattedValue > 1000000) {
      return (formattedValue / 1000000) + 'Mꜩ'
    } else if (formattedValue > 1000) {
      return (formattedValue / 1000).toFixed(2) + ' Kꜩ'
    } else {
      return formattedValue + ' ꜩ'
    }
  }
}
