'use strict';

angular.module('travelPlanningGame.app')
	.factory('bankingAccounts', function() {

		///////////////////////////////
		// Typical finance details //
		///////////////////////////////
		var Account = function(openingBalance) {
			// Track the balance
			this.balance = {};
			this.balance.initial = 0 + openingBalance; // opening balance
			this.balance.current = 0 + openingBalance; // closing balance
			this.balance.history = {};
			// Check restrictions on withdrawal
			this._canWithdraw = function(amount) {
				return amount <= this.balance.current;
			};
			// Record a balance in history
			this._recordSnapshot = function(timestamp, credit) {
				// Prepare a timestamp as identifier
				if (!timestamp) timestamp = new Date().getTime();
				// Timestamp must be unique
				if (angular.isDefined(this.balance.history[timestamp]))
					return false; // failed

				// Save snapshot
				this.balance.history[timestamp] = {
					openingBalance: this.balance.current
					, closingBalance: this.balance.current + credit
				};

				return true;
			};

			// Track the transactions
			this.transactions = {};
			var Transaction = function(credit, description) {
				this.credit = 0 + credit; // amount to credit
				// for debits, just supply a negative credit
				this.description = description; // any notes
			};
			// Raw transaction - validation is the responsibility of the caller
			this._makeTransaction = function(credit, description, timestamp) {
				// Create a transaction
				var transaction = new Transaction(credit, description);

				// Prepare a timestamp as identifier
				if (!timestamp) timestamp = new Date().getTime();
				// Timestamp must be unique
				if (angular.isDefined(this.transactions[timestamp]))
					return false; // failed

				// Freeze the current balance and record the opening/closing balance
				if (!this._recordSnapshot(timestamp, credit))
					return false;

				// Record the transaction
				this.transactions[timestamp] = transaction;

				// Update the balance
				this.balance.current += credit;

				return true; // fin
			};
			// Add money to the account
			this.credit = function(amount, description, timestamp) {
				// Must be positive amount
				if (amount > 0)
					return this._makeTransaction(amount, description, timestamp);
				else
					return false;
			};
			// Withdraw money from the account
			this.debit = function(amount, description, timestamp) {
				// Sufficient balance must be available
				if (amount > 0 && this._canWithdraw(amount))
					return this._makeTransaction(-1 * amount, description, timestamp);
				else
					return false;
			};

			// History access
			this.getSnapshot = function(timestamp) {
				if (timestamp)
					return this.balance.history[timestamp];
				else
					return null;
			};
			this.getTransaction = function(timestamp) {
				if (timestamp)
					return this.transactions[timestamp];
				else
					return null;
			};
		};

		var accounts = {};
		this.createAccount = function(id, openingBalance) {
			if (!openingBalance)
				openingBalance = 0;

			if (id) {
				var account = new Account(openingBalance);
				accounts[id] = account;
				return account;
			} else
				return null;
		};
		this.getAccount = function(id) {
			if (id)
				return accounts[id];
			else
				return null;
		};

		return this;
	})
	.factory('bankingManager', function(bankingAccounts) {

		///////////////////////////////////////////////////
		// Types and categories of gains and expenses  //
		///////////////////////////////////////////////////

		// Expense and gain categories
		var categories = {};
		categories.GENERAL = 10; // default, avoid using
		categories.ONETIME = 20; // example, one-time xp gains
		categories.VISITING = 30; // example, visiting costs
		categories.LODGING = 40; // example, visiting costs
		categories.SHOPPING = 50; // example, shopping costs or souvenir gains
		categories.RANDOM = 60; // from various random events
		categories.OTHER = 70; // just for safety

		// Expense and gain types
		var types = {};
		types.GENERAL = 10; // default, avoid using
		types.MONEY = 20; // raw money
		types.XP = 30; // experience points
		types.SOUVENIR = 40; // souvenirs acquired from shopping
		types.OTHER = 50; // just for safety

		///////////////////////////////////
		// Manages budget and expenses //
		///////////////////////////////////

		var Finances = function(budget) {
			this.types = types;
			this.categories = categories;

			// Accounts for actual resource tracking
			bankingAccounts.createAccount(this.types.MONEY, budget); // money spending
			bankingAccounts.createAccount(this.types.XP); // xp point gains
			bankingAccounts.createAccount(this.types.SOUVENIR); // shopping gains

			// Allow multiple transactions per day by extending the timestamp with the category
			this._categorizedTimestamp = {};
			this._categorizedTimestamp._delimiter = "##";
			// Create an extended timestamp out of the supplied time and category
			this._categorizedTimestamp.marshal = function(timestamp, category) {
				var delimiter = this._delimiter;
				return timestamp + delimiter + category;
			};
			// Get the original timestamp and category back from the extended timestamp
			this._categorizedTimestamp.unmarshal = function(extendedTimestamp) {
				var delimiter = this._delimiter;
				var originalComponents = extendedTimestamp.split(delimiter);

				// Make sure we can unmarshal with some surety
				if (originalComponents.length !== 2)
					return null; // failed, delimiter may not be unique enough

				return {
					timestamp: originalComponents[0]
					, category: originalComponents[1]
				};
			};

			// Add an expense
			this.addExpense = function(amount, type, category, timestamp) {
				if (!type || !category || !amount)
					return false;

				// Prepare a timestamp as identifier (not necessarily unique)
				if (!timestamp) timestamp = new Date().getTime();

				// Prepare a timestamp that includes the category
				var extendedTimestamp = this._categorizedTimestamp.marshal(timestamp, category);

				// Update the appropriate account
				return bankingAccounts.getAccount(type).debit(amount, category, extendedTimestamp);
			};

			// Add a resource gain
			this.addGain = function(amount, type, category, timestamp) {
				if (!type || !category || !amount)
					return false;

				// Prepare a timestamp as identifier (not necessarily unique)
				if (!timestamp) timestamp = new Date().getTime();

				// Prepare a timestamp that includes the category
				var extendedTimestamp = this._categorizedTimestamp.marshal(timestamp, category);

				// Update the appropriate account
				return bankingAccounts.getAccount(type).credit(amount, category, extendedTimestamp);
			};

			// Current resource standing
			this.get = function(type) {
				return bankingAccounts.getAccount(type).balance.current;
			};
			this.getBudget = function() { return this.get(this.types.MONEY); };
			this.getXP = function() { return this.get(this.types.XP); };
			this.getSouvenirs = function() { return this.get(this.types.SOUVENIR); };
			this.getActivity = function(timestamp) {
				var activity = {};

				angular.forEach(this.types, function(type, typeID) {
					activity[type] = {};
					var account = bankingAccounts.getAccount(type);

					if (account) {
						angular.forEach(this.categories, function(category, categoryID) {
							var extendedTimestamp = this._categorizedTimestamp.marshal(timestamp, category);

							activity[type][category] = bankingAccounts.getAccount(type).getTransaction(
								extendedTimestamp);
						}, this);
					}

				}, this);

				return activity;
			};
		};

		var managedFinances = {};
		this.manage = function(id, openingBalance) {
			if (id) {
				if (managedFinances[id])
					return managedFinances[id];
				else {
					var finances = new Finances(openingBalance);
					managedFinances[id] = finances;
					return finances;
				}
			} else
				return null;
		};
		this.types = types;
		this.categories = categories;

		return this;
	});
