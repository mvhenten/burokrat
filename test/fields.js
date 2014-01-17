'use strict';

var assert = require('assert'),
    util = require('util'),
    _ = require('lodash'),
    Burokrat = require('../index'),
    Faker = require('Faker');

suite('burokrat', function() {

    test('fields. widget', function(){
        var cases = [
            {

                label: 'Placeholder for an textarea',
                field: {
                    type: 'textarea',
                    required: false,
                    value: Faker.Lorem.sentence(),
                    placeholder: Faker.Lorem.sentence(),
                    label: Faker.Lorem.sentence(),
                },
                expect: function(){
                    return util.format('<textarea name="name" id="id_name" placeholder="%s">%s</textarea>',
                            this.field.placeholder, this.field.value
                    );
                }
            },
            {

                label: 'Placeholder not set for textarea when empty',
                field: {
                    type: 'textarea',
                    required: false,
                    value: Faker.Lorem.sentence(),
                    placeholder: '',
                    label: Faker.Lorem.sentence(),
                },
                expect: function(){
                    return util.format('<textarea name="name" id="id_name">%s</textarea>',
                            this.field.value
                    );
                }
            }
        ];


        _.each( cases, function(testCase){
                var Form = Burokrat.create(function(){
                    this.fields = { name: testCase.field };
                }),
                form = new Form();

                assert.equal( form.renderedFields.name.html, testCase.expect(), testCase.label );
        });

    });


});
