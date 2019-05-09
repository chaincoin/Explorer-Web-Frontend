
var blockchainApiUrl = "https://blockchain-test.chaincoinexplorer.co.uk";
var webServicesApiUrl = "wss://websocket-test.chaincoinexplorer.co.uk";
var notificationsApiUrl = "https://notifications-test.chaincoinexplorer.co.uk";
var environment = "Test";


if (window.location.host == "staging.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://blockchain-staging.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://websocket-staging.chaincoinexplorer.co.uk";
    notificationsApiUrl = "https://notifications-staging.chaincoinexplorer.co.uk";
    environment = "Staging";
}



if (window.location.host == "test.chaincoinexplorer.co.uk")
{
    blockchainApiUrl = "https://blockchain-test.chaincoinexplorer.co.uk";
    webServicesApiUrl = "wss://websocket-test.chaincoinexplorer.co.uk";
    notificationsApiUrl = "https://notifications-test.chaincoinexplorer.co.uk";
    environment = "Test";
}



if (window.location.host == "explorer.chaincoin.org")
{
    blockchainApiUrl = "https://api.chaincoin.org";
    webServicesApiUrl = "wss://websocket.chaincoin.org/";
    notificationsApiUrl = "https://notifications.chaincoin.org";
    environment = "Live";
}

if (window.location.host == "test-explorer.chaincoin.org")
{
    blockchainApiUrl = "https://api-test.chaincoin.org";
    webServicesApiUrl = "wss://websocket-test.chaincoin.org";
    notificationsApiUrl = "https://notifications-test.chaincoin.org";
    environment = "Test";
}


export default {
    blockchainApiUrl,
    webServicesApiUrl,
    notificationsApiUrl,
    environment
};