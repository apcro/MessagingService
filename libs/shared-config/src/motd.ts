/**
 * Outputs a console message of the day
 * @param {(string|string[])} [message] - The message
 * @returns {Number} Returns the value of x for the equation.
 */
const motd = (message) => {
  const lines = typeof message === 'string' ? [message] : message
  const minLength = Math.max(32, ...lines.map((line) => line.length + 2))

  /* eslint-disable no-console */
  console.log('\x1b[34m')
  console.log(`╭${'─'.repeat(minLength)}╮`)
  console.log(`│${' '.repeat(minLength)}│`)
  lines.forEach((line) => {
    console.log(
      `│${' '.repeat(
        Math.floor((minLength - line.length) / 2),
      )}${line}${' '.repeat(Math.ceil((minLength - line.length) / 2))}│`,
    )
  })
  console.log(`│${' '.repeat(minLength)}│`)
  console.log(`╰${'─'.repeat(minLength)}╯`)
  console.log('\x1b[0m')
  /* eslint-enable no-console */
}

export default motd
