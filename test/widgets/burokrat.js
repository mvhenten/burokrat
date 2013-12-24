'use strict';

var assert = require('assert'),
    _ = require('lodash'),
    util = require('util'),
    Widgets = require('../../lib/widgets/burokrat'),
    Faker = require('Faker');

suite('burokrat/widgets', function() {
    test('simple input types', function() {
        _.each(['text', 'email', 'hidden', 'color', 'tel'], function(type) {
            var classes = Faker.Lorem.words(),
                value = Faker.Lorem.sentence(),
                name = _.sample(Faker.Lorem.words()),
                attributes = {
                    autocomplete: _.sample([true, false]),
                    placeholder: Faker.Lorem.sentence()
                };

            var input = Widgets[type]({
                classes: classes,
                attributes: attributes
            });

            var html = input.toHTML(name, {
                value: value
            });

            var expect = util.format(
                '<input autocomplete="%s" classes="%s" id="id_%s" name="%s" placeholder="%s" type="%s" value="%s" />',
                attributes.autocomplete,
                classes.join(' '), name, name,
                attributes.placeholder, type, value
            );

            assert.equal(html, expect);
        });
    });

    test('input type checkbox', function() {
        var input = Widgets.checkbox(),
            name = _.sample(Faker.Lorem.words());

        var cases = [
            {
                label: 'Checkbox not checked when no value',
                expect: util.format('<input id="id_%s" name="%s" type="checkbox" value="on" />', name, name),
                field: {}
            },
            {
                label: 'Checkbox not checked when value false',
                expect: util.format('<input id="id_%s" name="%s" type="checkbox" value="on" />', name, name),
                field: {
                    value: false
                }
            },
            {
                label: 'Checkbox not checked when value falsy',
                expect: util.format('<input id="id_%s" name="%s" type="checkbox" value="on" />', name, name),
                field: {
                    value: 0
                }
            },
            {
                label: 'Checkbox  checked when value true',
                expect: util.format('<input checked="checked" id="id_%s" name="%s" type="checkbox" value="on" />', name, name),
                field: {
                    value: true
                }
            },
            {
                label: 'Checkbox  checked when value truthy',
                expect: util.format('<input checked="checked" id="id_%s" name="%s" type="checkbox" value="on" />', name, name),
                field: {
                    value: 'on'
                }
            },
        ];

        _.each(cases, function(testCase) {
            assert.equal(input.toHTML(name, testCase.field), testCase.expect, testCase.label);
        });
    });

    test('input type password', function() {
        var input = Widgets.password(),
            name = _.sample(Faker.Lorem.words()),
            field = {
                value: 'secret'
            };

        assert.equal(input.toHTML(name, field), util.format('<input id="id_%s" name="%s" type="password" />', name, name), 'value is never exposed');
    });

    test('textarea', function() {
        var input = Widgets.textarea(),
            name = _.sample(Faker.Lorem.words()),
            field = {
                value: Faker.Lorem.sentence()
            },
            expect = util.format('<textarea id="id_%s" name="%s">%s</textarea>', name, name, field.value);

        assert.equal(input.toHTML(name, field), expect, 'textarea renders like expected');
    });

    test('select', function() {
        var input = Widgets.select(),
            name = _.sample(Faker.Lorem.words()),
            field = {
                options: Faker.Lorem.words(),
                value: Faker.Lorem.sentence()
            };

        console.log(input.toHTML(name, field));

    });

});
