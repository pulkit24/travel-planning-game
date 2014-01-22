'use strict';

describe('Service: bankingAccounts', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var bankingAccounts;
	beforeEach(inject(function(_bankingAccounts_) {
		bankingAccounts = _bankingAccounts_;
	}));

	it('should create a new account', function() {
		bankingAccounts.createAccount('myAccount', 10000);
		expect(bankingAccounts.getAccount('myAccount').balance.current).toBe(10000);
	});

	it('should handle transactions', function() {
		bankingAccounts.createAccount('myAccount', 10000).credit(5000, 'lottery', 'T1');
		expect(bankingAccounts.getAccount('myAccount').balance.current).toBe(15000);
		bankingAccounts.getAccount('myAccount').debit(20000, 'overdraw', 'T2');
		expect(bankingAccounts.getAccount('myAccount').balance.current).toBe(15000);
		bankingAccounts.getAccount('myAccount').debit(10000, 'safe to draw', 'T3');
		expect(bankingAccounts.getAccount('myAccount').balance.current).toBe(5000);
		expect(bankingAccounts.getAccount('myAccount').getSnapshot('T1').closingBalance).toBe(15000);
		expect(bankingAccounts.getAccount('myAccount').getTransaction('T3').description).toBe('safe to draw');
	});
});

describe('Service: bankingManager', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var bankingManager;
	beforeEach(inject(function(_bankingManager_) {
		bankingManager = _bankingManager_;
	}));

	it('should create a new managed account', function() {
		bankingManager.manage('myFinances', 10000);
		expect(bankingManager.manage('myFinances').get(bankingManager.types.MONEY)).toBe(10000);
	});

	it('should handle expenses and gains', function() {
		bankingManager.manage('myFinances', 10000)
			.addExpense(5000, bankingManager.types.MONEY, bankingManager.categories.VISITING, 'T1');
		bankingManager.manage('myFinances')
			.addGain(20, bankingManager.types.XP, bankingManager.categories.VISITING, 'T1');
		expect(
			bankingManager.manage('myFinances')
			.get(bankingManager.types.MONEY)
		).toBe(5000);
		expect(
			bankingManager.manage('myFinances')
			.get(bankingManager.types.XP)
		).toBe(20);
		expect(
			bankingManager.manage('myFinances').getActivity('T1')
			[bankingManager.types.XP][bankingManager.categories.VISITING].credit
		).toBeDefined();
	});
});
