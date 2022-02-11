import React, { Component } from "react";
import './gesichtEin.css'
import { Button, Container, Row, Col, Input, Alert } from 'reactstrap'
import http from './http-axios'
//import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

class PDFVewier extends Component {}



export default PDFVewier;
/*
let jedesKlause = this.state.allesSprach.map(b => {
    let second = b.split("")
    console.log(second)
    if (second[0] === ">" && second[1] === "2") {
        let replace = b.replace('>2', '')
        return (
        <div>
            <Row className="contract-text-second">{replace}</Row>
        </div>
        )
    } else if (second[1] === ">" && second[2] === "2") {
        let replace = b.replace('>2', '')
        return (
        <div>
            <Row className="contract-text-second">{replace}</Row>
        </div>
        )
    } else {
        return (
        <div>
            <br />
            <Row><h4>{b}</h4></Row>
        </div>
        )
    }
})

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
})
const PrintPDFDocument = () => {
    <Document>
        <Page size="A4" style={styles.page}>
        <View style={styles.section}>
            <Row>
            <br />
            <Text><h3>{this.state.contractTitle}</h3></Text>
            <br />
            <Text>
            <br />
            <Row>The {this.state.contractTitle} is signed by</Row>
            <br />
            <Row><div><b>{this.state.mainPartyuppercase}</b> hereinafter as FIRST PARTY, the address is {this.state.einOrt}, {this.state.einAnderer}</div></Row>
            <br />
            <Row>, and </Row>
            <Row>
            <div><b>{this.state.zweitePartyuppercase}</b> hereinafter as SECOND PARTY, the address is {this.state.zweiOrt}, {this.state.zweiAnderer}</div>
            </Row>
            </Text>
            </Row>
            <br />
            <Row><Text>{jedesKlause}</Text></Row>
        </View>
        </Page>
    </Document>
    }
ReactDOM.render(<PDFViewer>{PrintPDFDocument}</PDFViewer>, document.getElementById('root'))
*/