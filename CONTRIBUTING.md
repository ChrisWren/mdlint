# Tests

We use the [mocha](http://visionmedia.github.io/mocha/) test framework and [should](https://github.com/visionmedia/should.js/) assertion library to test mdlint. In addition we use [sinon](http://sinonjs.org/docs/) to spy on and mock methods. To lint the source code and run the test suite, enter the following command:

```bash
grunt
```

There are integration tests located in [this](https://github.com/ChrisWren/mdlint/blob/master/test/integrationTests.js) file which verify that the html files were created as expected, and unit tests in [this](https://github.com/ChrisWren/mdlint/blob/master/test/unitTests.js) file which verify the logic implemented in library methods.

The goal is to add any new features into the integration test file and add any changes to library method logic to the unit test file.
