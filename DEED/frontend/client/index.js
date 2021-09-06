import Web3 from 'web3';
import Deed from '../build/contracts/Deed.json';

let web3;
let deed;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if(typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
  });
};

const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    Deed.abi, 
    Deed
      .networks[networkId]
      .address
  );
};

const initApp = () => {
  const $balance = document.getElementById('balance');
  const $withdraw = document.getElementById('withdraw');
  const $withdrawResult = document.getElementById('withdraw-result');
  let accounts = [];

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
  });

  
    const refreshBalance = () => {
      web3.eth.getBalance(deed.options.address)
      .then(result => {
        $balance.innerHTML = result;
      });
    };
    refreshBalance();

    $withdraw.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = e.target.elements[0].value;
      deed.methods
      .withdraw()
      .send({from: accounts[0], value: amount})
      .then(result => {
        $withdrawResult.innerHTML = 'The withdrawal was successful';
        refreshBalance();
      })
      .catch(_e => {
        $withdrawResult.innerHTML = 'There is an error';
      });
    });
  

};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_deed => {
      deed = _deed;
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
