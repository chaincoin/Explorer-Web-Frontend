var blockchainApiUrl = "https://blockchain.chaincoinexplorer.co.uk";
var webServicesApiUrl = "wss://websocket.chaincoinexplorer.co.uk";
var notificationsApiUrl = "https://notifications.chaincoinexplorer.co.uk";
var environment = "Live";


/*
var blockchainApiUrl = "https://blockchain-test.chaincoinexplorer.co.uk";
var webServicesApiUrl = "wss://websocket-test.chaincoinexplorer.co.uk";
var notificationsApiUrl = "https://notifications-test.chaincoinexplorer.co.uk";
var environment = "Test";*/


if (window.location.host == "localhost:3000")
{
    /*
    blockchainApiUrl = "https://blockchain-staging.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://websocket-staging.chaincoinexplorer.co.uk";
    notificationsApiUrl = "https://notifications-staging.chaincoinexplorer.co.uk";
    environment = "Staging";*/
/*
    var blockchainApiUrl = "https://blockchain-test.chaincoinexplorer.co.uk";
    var webServicesApiUrl = "wss://websocket-test.chaincoinexplorer.co.uk";
    var notificationsApiUrl = "https://notifications-test.chaincoinexplorer.co.uk";
    var environment = "Test";*/


    blockchainApiUrl = "http://127.0.0.1:8080";
    webServicesApiUrl = "ws://127.0.0.1:8080";
    environment = "Live";
}


if (window.location.host == "staging.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://api-staging.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://api-staging.chaincoinexplorer.co.uk";
    environment = "Staging";
}



if (window.location.host == "test.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://api-test.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://api-test.chaincoinexplorer.co.uk";
    environment = "Test";
}



if (window.location.host == "explorer.chaincoin.org")
{
    blockchainApiUrl = "https://api.chaincoin.org";
    webServicesApiUrl = "wss://api.chaincoin.org/";
    environment = "Live";
}

if (window.location.host == "test-explorer.chaincoin.org")
{
    blockchainApiUrl = "https://api-test.chaincoin.org";
    webServicesApiUrl = "wss://api-test.chaincoin.org";
    environment = "Test";
}


export default {
    blockchainApiUrl,
    webServicesApiUrl,
    notificationsApiUrl,
    environment
};