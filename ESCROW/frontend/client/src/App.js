import React, { Component } from 'react';
import { getWeb3 } from './utils.js';
import Escrow from './contracts/Escrow.json';

class App extends Component {
  state = {
    web3: undefined,
    accounts: [],
    currentAccount: undefined,
    contract: undefined,
    balance: undefined
  }

  componentDidMount() {
    const web3 = await getWeb3();
    const accounts = web3.eth.getAccounts();
    const networkId = web3.eth.net.getId();
    const deployedNetwork = Escrow.networks[networkId];
    const contract = new web3.eth.Contract(
      Escrow.abi,
      deployedNetwork && deployedNetwork.address
    );

    this.setState({web3, accounts, contract}, this.updateBalance);
  }

  updateBalance() {
    //extract the contract from the state
    const { contract } = this.state;
    const balance = await contract.methods.balanceOf().call();
    //save the balance in the state of our component
    this.setState({ balance });
  }

  deposit(e) {
    e.preventDefault();
    const { contract, accounts } = this.state;
    await contract.methods.deposit().send({
      from: accounts[0],
      value: e.target.elements[0].value
    });
    this.updateBalance();
  }

  release(e) {
    e.preventDefault();
    const { contract, accounts } = this.state;
    await contract.methods.release().send({
      from: accounts[0]
    });
    this.updateBalance();
  }


  render() {
    //make sure we are not rendering anything before web3 is ready
    if(!this.state.web3) {
      return <div>Loading...</div>;
    }
    //extract the balance from the state
    const { balance } = this.state;
    return (
      <div className="container">
        <h1 className="text-center">Escrow</h1>

        <div className="row">
          <div className="col-sm-12">
             <p>Balance: <b>{balance}</b> wei </p>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <!-- connect our form to javascript -->
            <form onSubmit={e => this.deposit(e)}>
              <div className="form-group">
                <label htmlFor="deposit">Deposit</label>
                <input type="number" className="form-control" id="deposit" />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>

        <br />

        <div className="row">
          <div className="col-sm-12">
             <button onClick={e => this.release(e)} type="submit" className="btn btn-primary">Release</button>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
