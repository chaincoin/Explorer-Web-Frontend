docker stop chaincoinExplorerDev
docker rm chaincoinExplorerDev

docker run --name chaincoinExplorerDev -p 9002:80 -d -i -t mcna/images:chaincoin-explorerv0.1-dev-ubuntu
#docker run -d -it --name chaincoinExplorerDev -p 9002:80  chaincoin-explorerv0.1-raspberry
#docker service create -d -t --name buckled -p 9002:80  --constraint 'node.labels.swarmrole==buckled' mcna/images:buckled-raspberry
set /p temp="Hit enter to continue"

