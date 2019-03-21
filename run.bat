docker stop chaincoinExplorer
docker rm chaincoinExplorer

docker run --name chaincoinExplorer -p 9001:80 -d -i -t mcna/images:chaincoin-explorerv0.1-ubuntu
#docker run -d -it --name chaincoinExplorer -p 9001:80  chaincoin-explorerv0.1-raspberry
#docker service create -d -t --name buckled -p 9001:80  --constraint 'node.labels.swarmrole==buckled' mcna/images:buckled-raspberry
set /p temp="Hit enter to continue"

