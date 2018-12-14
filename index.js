exports.handler = async (event) => {
    // TODO implement
    console.log('Version 1.0 of testing code build');
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
