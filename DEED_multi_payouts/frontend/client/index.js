import Web3 from 'web3';
import DeedMultiPayouts from '../build/contracts/DeedMultiPayout.json';

let web3;
let deedMultiPayouts;

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
    DeedMultiPayouts.abi, 
    DeedMultiPayouts
      .networks[networkId]
      .address
  );
};

const initApp = () => {
  $balance = document.getElementById('balance');
  $paidpayouts = document.getElementById('paid-payouts');
  $earliest = document.getElementById('earliest');
  $withdraw = document.getElementById('withdraw');
  $withdrawresult = document.getElementById('withdraw-result');
  let accounts = [];

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
  });

  const refreshBalance = () => {
    web3.eth.getBalance(deedMultiPayouts.options.address)
    .then(balance => {
      $balance.innerHTML = balance;
    });
  }

  const refreshpaidpayouts = () => {
deedMultiPayouts.methods.paidPayouts().call()
.then(paidpay => {
  $paidpayouts.innerHTML = `${paidpay}/10`;
    })
    .catch(_e => {
      $paidpayouts.innerHTML = 'There was an error while reading paidPayouts';
    });
  }

  const refreshEarliest = () => {
    deedMultiPayouts.methods
    .earliest()
    .call()
    .then(earliest => {
      $earliest.innerHTML = `${(new Date(parseInt(earliest) * 1000)).toLocaleString()}/10`;
    })
    .catch(_e => {
      $earliest.innerHTML = 'There was an error while reading earliest';
    });
  }



$withdraw.addEventListener('submit', (e) => {
  e.preventDefault();
  deedMultiPayouts.methods
  .withdraw()
  .then(result => {
    $withdrawresult.innerHTML = 'withdrawal successful';
    refreshBalance();
    refreshpaidpayouts();
    refreshEarliest();
  })
  .catch(_e => {
    $withdrawresult.innerHTML = 'withdrawal error';
  });

});

refreshBalance();
refreshpaidpayouts();
refreshEarliest();

};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_deedMultiPayouts => {
      deedMultiPayouts = _deedMultiPayouts;
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
