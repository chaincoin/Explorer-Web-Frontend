
var blockchainApiUrl = "https://blockchain.chaincoinexplorer.co.uk";
var webServicesApiUrl = "wss://websocket.chaincoinexplorer.co.uk";
var notificationsApiUrl = "https://notifications.chaincoinexplorer.co.uk";
var environment = "Live";


if (window.location.host == "staging.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://staging-blockchain.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://staging-websocket.chaincoinexplorer.co.uk";
    notificationsApiUrl = "https://staging-notifications.chaincoinexplorer.co.uk";
    environment = "Staging";
}



if (window.location.host == "test.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://test-blockchain.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://test-websocket.chaincoinexplorer.co.uk";
    notificationsApiUrl = "https://test-notifications.chaincoinexplorer.co.uk";
    environment = "Test";
}



if (window.location.host == "explorer.chaincoin.org")
{
    blockchainApiUrl = "https://api.chaincoin.org";
    webServicesApiUrl = "wss://websocket.chaincoin.org/";
    notificationsApiUrl = "https://notifications.chaincoin.org";
    environment = "Live";
}

if (window.location.host == "test.chaincoin.org")
{
    blockchainApiUrl = "https://test-api.chaincoin.org";
    webServicesApiUrl = "wss://test-websocket.chaincoin.org";
    notificationsApiUrl = "https://test-notifications.chaincoin.org";
    environment = "Test";
}


export default {
    blockchainApiUrl,
    webServicesApiUrl,
    notificationsApiUrl,
    environment
};