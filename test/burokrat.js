'use strict';

var assert = require('assert'),
    _ = require('lodash'),
    async = require('async'),
    Burokrat = require('../index'),
    Faker = require('Faker');

var Form = Burokrat.create(function() {
    this.fields = {
        name: {
            type: 'text',
            required: false,
            label: 'Screen name',
            validators: [

                function(f, field, next) {
                    var err = /\d+/.test(field.data) ? 'not a thing' : null;
                    return next(err);
            }]
        },
        profile: {
            description: {
                type: 'textarea',
                required: false,
                placeholder: 'lorem ipsum sit amet',
                label: 'Screen name',
            },
            culture: {
                type: 'select',
                options: ['nl-NL', 'en-EN'],
                error: 'Choose a valid culture',
                label: 'culture',
                validators: []
            },
            password: {
                type: 'password',
                required: true,
                label: 'Screen name',
                placeholder: '***',
                validators: []
            }
        }
    };
});

suite('burokrat', function() {

    test('nested fields', function() {
        var def = {
            one: {
                two: {
                    four: {
                        type: 'text',
                        required: 'I am required',
                        value: Faker.Lorem.sentence()
                    }
                }
            }
        };


        var Form = Burokrat.create(function() {
            this.fields = def;
        });

        var f = new Form();

        assert.equal(f.values.one.two.four, def.one.two.four.value);
    });

    test('form.values returns values', function(done) {
        var f = new Form();

        var values = {
            name: Faker.Name.findName(),
            profile: {
                culture: 'nl-NL',
                password: Faker.Lorem.sentence(),
                description: Faker.Company.catchPhrase()
            }
        };

        f.validate(values, function(err, form) {
            assert.deepEqual(form.errors, {}, 'got no errors');
            assert.equal(form.isValid, true);
            assert.deepEqual(form.values, values, 'expected values');

            done();
        });
    });

    test('check if error looks ok', function(done) {
        var f = new Form();

        var expect = {
            name: 'not a thing',
            profile: {
                culture: 'Choose a valid culture',
                password: 'This field is required.'
            }
        };

        f.validate({
            name: '123'
        }, function(err, form) {

            assert.deepEqual(form.errors, expect, 'got expected errors');
            assert.deepEqual(form.errors, f.errors, 'form state keeps the errors');

            done();
        });
    });

    test('required sets the error message', function(done) {
        var error = Faker.Lorem.sentence();

        var Form = Burokrat.create(function() {
            this.fields = {
                foo: {
                    type: 'text',
                    required: error
                }
            };
        });

        var f = new Form();

        f.validate({}, function() {
            var expect = {
                foo: error
            };

            assert.deepEqual(f.errors, expect);
            done();
        });
    });

    test('options has a built in error check', function(done) {
        var error = Faker.Lorem.sentence(),
            options = Faker.Lorem.words();

        var Form = Burokrat.create(function() {

            this.fields = {
                foo: {
                    type: 'select',
                    error: error,
                    options: options
                }
            };
        });

        var cases = [
            {
                label: 'Empty form is not ok',
                values: {},
                errors: {
                    foo: error,
                }
            },
            {
                label: 'Value must be one of options',
                values: {
                    foo: 'not an option'
                },
                errors: {
                    foo: error,
                }
            },
            {
                label: 'One of the options is ok',
                values: {
                    foo: _.sample(options)
                },
                errors: {}
            }
        ];

        async.each(cases, function(testCase, next) {
            var f = new Form();

            f.validate(testCase.values, function() {
                assert.deepEqual(f.errors, testCase.errors, testCase.label);
                next();
            });
        }, done);
    });

});
