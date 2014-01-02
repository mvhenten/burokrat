'use strict';

var _ = require('lodash');

function _walk(fields, name, done) {
    var stack = _.values(fields);

    while (stack.length > 0) {
        var field = stack.pop();

        if (!field.type) {
            stack = stack.concat(_.values(field));
            continue;
        }

        if (field.name !== name) continue;

        done(field);
    }
}

var Validate = {
    required: function(message) {
        var validator = function(fields, current, next) {
            var err = null;

            if ( current.value === undefined || current.value === null || current.value === '' ) {
                err = message;
            }

            next( err );
        };

        validator.forceValidation = true;
        return validator;
    },

    matchField: function(message, name) {
        return function(fields, current, done) {
            _walk(fields, name, function(field) {
                if (field.name !== name) return;

                done(field.value === current.value ? null : message);
            });
        };
    },

    options: function(message) {
        var validator = function(fields, current, next) {
            if (current.choices && current.choices[current.value]) return next();
            return next(message);
        };

        return validator;
    },

    depends: function(name, validation) {
        var validator = function(fields, current, done) {
            _walk(fields, name, function(field) {
                if (_.isEmpty(current.value) && _.isEmpty(field.value)) return done();
                return validation(fields, current, done);
            });
        };

        validator.forceValidation = true;
        return validator;
    },

    pair: function(message, name) {
        return function(fields, current, done) {
            if (!current.value && !current.required) {
                return done();
            }

            _walk(fields, name, function(field) {
                if (field.error) return done(message);

                field.error = _.isEmpty(field.value) ? message : null;

                done(field.error);
            });
        };
    },

    wholeNumber: function(message) {
        return function(fields, field, next) {
            var val = field.value;

            if (parseInt(val) == val) return next();
            return next(message);
        };
    }
};

module.exports = Validate;
