App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
	if (window.ethereum) {
	  App.web3Provider = window.ethereum;
	  try {
	    // Request account access
	    await window.ethereum.enable();
	  } catch (error) {
	    // User denied account access...
	    console.error("User denied account access")
	  }
	}
	// Legacy dapp browsers...
	else if (window.web3) {
	  App.web3Provider = window.web3.currentProvider;
	}
	// If no injected web3 instance is detected, fall back to Ganache
	else {
	  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	}
	web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
	  $.getJSON('Pharma.json', function(data) {
	  // Get the necessary contract artifact file and instantiate it with truffle-contract
	  var AdoptionArtifact = data;
	  App.contracts.Pharma = TruffleContract(AdoptionArtifact);

	  // Set the provider for our contract
	  App.contracts.Pharma.setProvider(App.web3Provider);

	  // Use our contract to retrieve and mark the adopted pets
	  return App.markPurchase();
	});

    return App.bindEvents();
  },


  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
    $(document).on('click', '.btn-create', App.handleCreate);
  },

  markPurchase: function(adopters, account) {
	var purchaseInstance;

	App.contracts.Pharma.deployed().then(function(instance) {
	  purchaseInstance = instance;

	  return purchaseInstance.getManufactuers.call();
	}).then(function(buyers) {
	  for (i = 0; i < buyers.length; i++) {
	    if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
	      $('.panel-drug').eq(i).find('button').text('Success').attr('disabled', true);
	    }
	  }
	}).catch(function(err) {
	  console.log(err.message);
	});

  },

  handlePurchase: function(event) {
    event.preventDefault();

    var serialId = parseInt($(event.target).data('id'));
	//
	var purchaseInstance;

	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
	    console.log(error);
	  }

	  var account = accounts[0];

	  App.contracts.Pharma.deployed().then(function(instance) {
	    purchaseInstance = instance;

	    // Execute adopt as a transaction by sending account
	    return purchaseInstance.transact(0x69236D431226d256768cC60Cae6d2b0A766471a7, 12321);
	  }).then(function(result) {
	    return App.markPurchase();
	  }).catch(function(err) {
	    console.log(err.message);
	  });
	});

  },
  handleCreate: function(event){
	event.preventDefault();
	var createInstance;
	// get user's accounts
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
	    console.log(error);
	  }
	  var account = accounts[0];
	  
	  App.contracts.Pharma.deployed().then(function(instance){
		createInstance = instance;
		// Create information
		return createInstance.create(123213, 12321, {from: account});

	}).then(function(result) {
		console.log("done");
		//return App.markCreated();
	}).catch(function(err) {
		console.log(err.message);
	});
	});
  },
  handleView: function(event){
	event.preventDefault();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
