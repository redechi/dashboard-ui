#FE Build System
---

###Install Package Managers and Generators:

we will be using the (marionette generator)[https://github.com/mrichard/generator-marionette] to ensure that tests are created with each front end object.

Install phantomjs with brew. Its a commandline browser emulator and will be used for testing.

```
brew install phantomjs
```

yo: Yeoman, a front end project generator. will be used for object and test creation.

bower: Front-end package manager.

grunt-cli: It ensures that your running the correct version of grunt for your project.

generator-marionette: a yeoman generator for marionette/backbone.

generator-mocha-amd: generates our mocha test files when an object is created via marionette generator.

Install all of these with the following one-liner.

```
npm install -g yo grunt-cli bower generator-mocha-amd generator-marionette
```


###Install Dependencies

install all of the project dependencies

```
bower install
npm install
```

###Run The Project

Start your node api. Then start the asset server.
```
grunt
```
