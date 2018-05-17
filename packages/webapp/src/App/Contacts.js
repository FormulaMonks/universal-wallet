import React, { Component, Fragment } from 'react';
import { Header } from '../components';
import { ContactsStore } from '../stores';

const getFormValues = ({ inputAlias, inputPublicAddress }) => {
  return {
    alias: inputAlias.value,
    publicAddress: inputPublicAddress.value,
  };
};

class Form extends Component {
  render() {
    const { btnLabel, onCancel, defaultValues = {} } = this.props;
    const { publicAddress = '', alias = '' } = defaultValues;
    return (
      <form
        ref={f => (this.form = f)}
        onSubmit={this.onSubmit}
        key={Date.now()}
      >
        <input type="submit" value={btnLabel} />
        {onCancel && <button onClick={onCancel}>Cancel</button>}
        <input
          placeholder="Public Address"
          type="text"
          name="inputPublicAddress"
          required
          defaultValue={publicAddress}
        />
        <input
          placeholder="Alias"
          type="text"
          name="inputAlias"
          required
          defaultValue={alias}
        />
      </form>
    );
  }

  onSubmit = e => {
    e.preventDefault();
    this.props.onSubmit(this.form);
  };
}

class Contacts extends Component {
  state = {
    edit: null,
  };

  render() {
    const { contacts, contactsError, contactsLoading } = this.props;
    const { edit } = this.state;
    const sortedList = contacts.sort((a, b) => b.lastModified - a.lastModified);

    return (
      <Fragment>
        <div>
          {contactsError}
          {edit ? (
            <Form
              defaultValues={{ ...contacts.find(({ id }) => id === edit) }}
              onCancel={this.onCancelEdit}
              onSubmit={this.onEdit}
              btnLabel={'Save'}
            />
          ) : (
            <Form onSubmit={this.onNew} btnLabel={'Add new'} />
          )}
          {contactsLoading ? (
            <div>loading</div>
          ) : (
            <ul>
              {sortedList.map(
                ({ id, createdAt, lastModified, alias }, index) => {
                  const created = new Date(createdAt);
                  const modified = new Date(lastModified);
                  return (
                    <li key={`contacts-${id}`}>
                      <button onClick={() => this.setState({ edit: id })}>
                        Edit
                      </button>
                      <div>{alias}</div>
                      <div>created {created.toDateString()}</div>
                      <div>last modified {modified.toDateString()}</div>
                      <button onClick={() => this.onDelete(id)}>Delete</button>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </div>
      </Fragment>
    );
  }

  onDelete = async id => {
    await this.props.contactsDelete(id);
    this.props.contactsGet();
  };

  onEdit = async form => {
    await this.props.contactsPut(this.state.edit, getFormValues(form));
    form.reset();
    this.props.contactsGet();
  };

  onEditCancel = e => {
    e.preventDefault();
    this.setState({ edit: null });
  };

  onNew = async form => {
    await this.props.contactsPost(getFormValues(form));
    form.reset();
    this.props.contactsGet();
  };
}

export default () => (
  <Fragment>
    <Header />
    <ContactsStore>
      <Contacts />
    </ContactsStore>
  </Fragment>
);
