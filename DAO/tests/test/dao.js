const { expectRevert, time } = require('@openzeppelin/test-helpers');
const DAO = artifacts.require('DAO');

contract('DAO', (accounts) => {
  let dao;

  const [investor1, investor2, investor3] = [accounts[1], accounts[2], accounts[3]];
  before(async () => {
    dao = await DAO.new(2, 2, 50);
  });

  it('Should accept contribution', async () => {
    await dao.contribute({from: investor1, value: 100});
    await dao.contribute({from: investor2, value: 200});
    await dao.contribute({from: investor3, value: 300});

    const shares1 = await dao.shares(investor1);
    const shares2 = await dao.shares(investor2);
    const shares3 = await dao.shares(investor3);
    const isInvestor1 = await dao.investors(investor1);
    const isInvestor2 = await dao.investors(investor2);
    const isInvestor3 = await dao.investors(investor3);
    const totalShares = await dao.totalShares();
    const availableFunds = await dao.availableFunds();

    assert(shares1.toNumber() === 100);
    assert(shares2.toNumber() === 200);
    assert(shares3.toNumber() === 300);
    assert(isInvestor1 === true);
    assert(isInvestor2 === true);
    assert(isInvestor3 === true);
    assert(totalShares.toNumber() === 600);
    assert(availableFunds.toNumber() === 600);
  });

  it('Should NOT accept contribution after contributionTime', async () => {
    await time.increase(2001);
    await expectRevert(
      dao.contribute({from: investor1, value: 100}),
      'cannot contribute after contributionEnd'
    );
  });

  it('Should create proposal', async () => {
    await dao.createProposal(
      'proposal 1',
      100,
      accounts[8],
      {from: investor1}
      );

      const proposal = await dao.proposals(0);
      assert(proposal.name === 'proposal 1');
      assert(proposal.recipient === accounts[8]);
      assert(proposal.amount.toNumber() === 100);
      assert(proposal.votes.toNumber() === 0);
      assert(proposal.executed === false);

  });

  it('Should NOT create proposal if not from investor', async () => {
    await expectRevert(
      dao.createProposal(
      'proposal 2',
      10,
      accounts[4],
      {from: accounts[6]}
    ),
    'only investors'
    );
  });

  it('Should NOT create proposal if amount too big', async () => {
    
    await expectRevert(
      dao.createProposal(
        'proposal 2',
        1000,
        accounts[4],
        {from: investor1}
      ),
      'amount too big'
    );
  });

  it('Should vote', async () => {
  
    await dao.vote(0, {from: investor1});
    const voteCheck = await dao.votes(accounts[1], 0);
    assert(voteCheck === true);
    


    
  });

  it('Should NOT vote if not investor', async () => {
    
    await expectRevert(
      dao.vote(0, {from: accounts[6]}),
      'only investors'
    );

  });

  it('Should NOT vote if already voted', async () => {
    
    await expectRevert(
      dao.vote(0, {from: investor1}),
      'investor can only vote once for a proposal'
    );
  });

  it('Should NOT vote if after proposal end date', async () => {
    await time.increase(2001);
    await expectRevert(
      dao.vote(0, {from: investor2}),
      'can only vote until proposal end date'
    );
  });

  it('Should execute proposal', async () => {
    await dao.createProposal('proposal 2', 100, accounts[8], {from: investor1});
    await dao.vote(1, {from: investor1});
    await dao.vote(1, {from: investor3});
    await time.increase(2001);
    
    await dao.executeProposal(1);
    const check = await dao.proposals(1);
    assert(check.executed === true);  
  });

  //it('Should NOT execute proposal if not enough votes', async () => {
  //});

  it('Should NOT execute proposal twice', async () => {
    await expectRevert(
      dao.executeProposal(1),
      'cannot execute proposal already executed'
    );
  });

  it('Should NOT execute proposal before end date', async () => {
    await dao.createProposal('proposal 4', 50, accounts[8], {from: investor1});
    await dao.vote(3, {from: investor1});
    await dao.vote(3, {from: investor2});
    expectRevert(
      dao.executeProposal(3),
      'cannot execute proposal before end date'
    );
  });

  it('Should withdraw ether', async () => {
    const balanceBefore = await web3.eth.getBalance(accounts[8]);
    await dao.withdrawEther(10, accounts[8]);
    const balanceAfter = await web3.eth.getBalance(accounts[8]);
    balanceAfterBN = web3.utils.toBN(balanceAfter);
    balanceBeforeBN = web3.utils.toBN(balanceBefore);
    assert(balanceAfterBN.sub(balanceBeforeBN).toNumber() === 10);
  });

  it('Should NOT withdraw ether if not admin', async () => {
    await expectRevert(
      dao.withdrawEther(10, accounts[8], {from: investor1}),
      'only admin'
    );
  });

  it('Should NOT withdraw ether if trying to withdraw too much', async () => {
    await expectRevert(
      dao.withdrawEther(1000, accounts[8]),
      'not enough availableFunds'
    );
  });
});
