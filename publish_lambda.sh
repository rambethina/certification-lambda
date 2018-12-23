npm install
rm -rf build-output
mkdir build-output
mkdir -p build-output/node_modules
cp -R *.js build-output
cp -R node_modules/* build-output/node_modules
cd build-output
zip -r ../build-output.zip *
cd ..
aws lambda update-function-code --function-name AWSCertification --zip-file fileb://build-output.zip