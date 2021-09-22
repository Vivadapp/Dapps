const AdvancedStorage = artifacts.require('AdvancedStorage');

contract('AdvancedStorage', () => {
   let advancedStorage = null;
   before(async () => {
       advancedStorage = await AdvancedStorage.deployed();
   });
   
   
    it('Should add an element to ids array', async () => {
        //const advancedStorage = await AdvancedStorage.deployed();
        await advancedStorage.add(10);
        const result = await advancedStorage.ids(0);
        assert(result.toNumber() === 10);
    });
    it('Should get an element of the ids array', async () => {
        //const advancedStorage = await AdvancedStorage.deployed();
        await advancedStorage.add(20);
        const result = await advancedStorage.get(1);
        assert(result.toNumber() === 20);
});
    it('Should get the ids array', async () => {
        //const advancedStorage = await AdvancedStorage.deployed();
        const rawIds = await advancedStorage.getAll();
        //transforme le tableau en regular javascript number
        const ids = rawIds.map(id => id.toNumber());
        assert.deepEqual(ids, [10, 20]);
});
    it('Should get the length of the ids array', async () => {
        //const advancedStorage = await AdvancedStorage.deployed();
        const length = await advancedStorage.length();
        assert(length.toNumber() === 2);
    })





});