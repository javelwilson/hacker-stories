import React from 'react'

class InputWithLabel extends React.Component {
  render() {
    const { id, value, type = 'text', onInputChange, children } = this.props
    return (
      <>
        <label htmlFor={id}>{children}</label>
        &nbsp;
        <input
          id={id}
          type={type}
          value={value}
          onChange={onInputChange}
        />{' '}
      </>
    )
  }
}

export default InputWithLabel
