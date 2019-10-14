call npm run build
docker build -t mcna/images:chaincoin-explorerv0.2.1.2-staging-ubuntu .
docker push mcna/images:chaincoin-explorerv0.2.1.2-staging-ubuntu
set /p temp="Hit enter to continue"