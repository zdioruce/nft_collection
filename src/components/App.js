import React, { Component } from 'react';
import Web3 from 'web3'
import Color from '../abis/Color.json'
import NavBar from './NavBar';
import logo from '../logo.png';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      account: '',
      contract: null,
      colors: [],
      balance: 0
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]

    if(networkData) {
      const contract = new web3.eth.Contract(Color.abi, networkData.address)
      this.setState({ contract: contract })

      const balance = await contract.methods.balanceOf(this.state.account).call()
      this.setState({ balance })

      //Load Colors
      for(var i = 0; i < balance; i++) {
        const color = await contract.methods.colors(i).call()
        this.setState({
          colors: [...this.state.colors, color]
        })
      }
    } else {
      window.alert('Color contract not deployed to detected network.')
    }
    

  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  mint = (color) => {
    this.state.contract.methods.mint(color).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({
        colors: [...this.state.colors, color]
      })
    })
  }
  
  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const color = this.color.value
                  this.mint(color)
                }}>
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="e.g #FFFFFF"
                    ref={(input) => { this.color = input }}
                  />
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="MINT"
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className='row text-center'>
            {
              this.state.colors.map((color, key) => {
                return(
                  <div key={key} className="col-md-3 mb-3">
                    <div className='token' style={{ backgroundColor: color }}></div>
                    <div>{color}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
