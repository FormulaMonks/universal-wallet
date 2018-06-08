import React, { Component } from 'react'

export default class Form extends Component {
  render() {
    const { children, onSubmit, ...props } = this.props

    return <form
      ref={f => (this.form = f)}
      onSubmit={this.onSubmit}
      {...props}
    >
      {children}
    </form>
  }

  onSubmit = e => {
    e.preventDefault()
    this.props.onSubmit(this.form)
  }
}

