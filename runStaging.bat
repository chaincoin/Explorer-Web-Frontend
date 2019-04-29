docker stop chaincoinExplorerStaging
docker rm chaincoinExplorerStaging

docker run --name chaincoinExplorerStaging -p 81:80 -d -i -t mcna/images:chaincoin-explorerv0.2-staging-ubuntu
set /p temp="Hit enter to continue"

