'use strict';

var assert = require('assert');

var Burokrat = require('../index');

var Form = Burokrat.create(function() {
    this.fields = {
        test: {
            type: 'text',
            required: false,
            label: 'Screen name',
            validators: [

                function(f, field, next) {
                    return next('not a thing');
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
                required: true,
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

suite('really simple checks', function() {

    test('check if error looks ok', function(done) {
        var f = new Form();

        var expect = {
            test: 'not a thing',
            profile: {
                culture: 'This field is required.',
                password: 'This field is required.'
            }
        };

        f.validate({
            test: '123'
        }, function(err, form) {
            assert.deepEqual(form.errors, expect, 'got expected errors');

            assert.deepEqual(f.errors, expect, 'got expected errors');
            done();
        });
    });
});
