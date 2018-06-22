export default num => {
  if (num.toLocaleString() === '0' && num !== 0) {
    return num
  }
  return num.toLocaleString()
}
