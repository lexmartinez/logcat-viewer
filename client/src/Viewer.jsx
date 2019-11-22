import React, { Component } from 'react';
import { Table, Checkbox, Input, Button } from 'semantic-ui-react';
import Websocket from 'react-websocket';

export default class Viewer extends Component {
  constructor() {
    super();
    this.state = { data: '', follow: false, search: '' };
    this.handleData = this.handleData.bind(this);
    this.processData = this.processData.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  handleData(socketData) {
    let data = `${this.state.data}${socketData}`;
    if (data.split('\n').length > 300) {
      data = socketData
    }
    this.setState({ data });
    if (this.state.follow) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  }

  processData() {
    const { data = '', search = ''} = this.state;
    return data.split('\n').map((line) => {
      let cols = line.split(' ').filter((item) => item !== '');
      if (cols.length >= 5) {
        return {
          time: `${cols[0]} ${cols[1]}`,
          pid: cols[2], tid: cols[3], type: cols[4],
          message: cols.slice(5).join(' ')
        }
      }
      return { message: line }
    }).filter((row) => {
      const { message = '', pid = '', tid = '' } = row;
      return !search  || `${message}${pid}${tid}`.toLowerCase().indexOf(`${search}`.toLowerCase()) !== -1
    })
  }

  exportData(data = []) {
    const fieldSeparator = ',';
    const rowSeparator = '\n';
    if (!!data && data.length > 0) {
      const headers = Object.keys(data[0]).join(fieldSeparator);
      let csv = data.map((row) => {
        return Object.values(row).map(i => `${i}`.replace(fieldSeparator, ' ')).join(fieldSeparator)
      });
      csv = [ headers, ...csv ].join(rowSeparator);
      const type = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? 'application/csv' : 'text/csv';
      const blob = new Blob(['\uFEFF', csv], {type});
      const dataURI = `data:${type};charset=utf-8,\uFEFF${csv}`;
      const URL = window.URL || window.webkitURL;
      const csvUrl = (typeof URL.createObjectURL === 'undefined')
        ? dataURI
        : URL.createObjectURL(blob);
      window.open(csvUrl,'_blank');
    }
  }
 
  render() {
    const { follow } = this.state;
    const data = this.processData();
    return (
      <Table celled={true} fixed={true} selectable={true} compact={true} striped={true}>
        <Websocket url='ws://localhost:8999' onMessage={this.handleData}/>
        <Table.Header fullWidth={true}>
          <Table.Row>
            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
            <Table.HeaderCell textAlign={'center'}>PID</Table.HeaderCell>
            <Table.HeaderCell textAlign={'center'}>TID</Table.HeaderCell>
            <Table.HeaderCell width={1} textAlign={'center'}>Type</Table.HeaderCell>
            <Table.HeaderCell width={11}>
              <div className={'options-head'}>
              <div className={'th-title'}>Message</div>
              <Input icon='search' placeholder='Search...' className={'input-search'} size={'small'}
                onChange={(event, data) => { this.setState({ search: data.value }) }}/>
              <Checkbox checked={follow} value={follow} toggle={false}
                label={'Follow Log'} className={'follow-checkbox'}
                onChange={(event, data) => { this.setState({ follow: data.checked }) }}/>
                <Button icon='download' basic={true} onClick={() => this.exportData(data)}/>
              </div>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data.map((item, index) => {
              return (
                  <Table.Row key={index} error={item.type === 'E'} warning={item.type === 'W'}>
                    <Table.Cell>{item.time}</Table.Cell>
                    <Table.Cell textAlign={'center'}>{item.pid}</Table.Cell>
                    <Table.Cell textAlign={'center'}>{item.tid}</Table.Cell>
                    <Table.Cell textAlign={'center'}>{item.type}</Table.Cell>
                    <Table.Cell>{item.message}</Table.Cell>
                  </Table.Row>
                );
            })
          }
        </Table.Body>
        <div ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </Table>
    );
  }
}