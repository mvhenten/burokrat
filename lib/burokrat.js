'use strict';

var _ = require('lodash'),
    async = require('async');

var Fields = require('./fields');

function _bind(fields, values) {
    values = values || {};

    return _.reduce(fields, function(fields, field, name) {
        var value = values[name];

        if (field.type) {
            fields[name] = field.bind(value);
            return fields;
        }

        fields[name] = _bind(field, value);
        return fields;
    }, {});
}

function _validate(fields, bound, done) {
    async.each(_.keys(bound), function(name, next) {
        var field = bound[name];

        if (field.type) {
            field.validate(fields, next);
            return;
        }

        _validate(fields, field, next);
    }, done);
}

function _errors(bound) {
    return _.reduce(bound, function(errors, field, name) {
        if (field.type) {
            if (field.error) {
                errors[name] = field.error;
            }
            return errors;
        }

        errors[name] = _errors(field);
        return errors;
    }, {});
}

function _fieldHTML(field) {
    var classes = field.classes() || [];

    if (field.error) {
        classes.push('error');
    }

    return {
        get field() {
            return field;
        },

        get value() {
            return field.value;
        },

        get toHTML() {
            return field.widget.toHTML(field.name, field);
        },

        get errorHTML() {
            return field.errorHTML();
        },

        get html() {
            return field.toHTML();
        },
        cssClasses: classes.join(' ')
    };
}

function _renderedFields(fields) {
    return _.reduce(fields, function(fields, field, name) {
        if (field.type) {
            fields[name] = _fieldHTML(field);
            return fields;
        }

        fields[name] = _renderedFields(field);
        return fields;
    }, {});
}

var proto = {
    set fields(fields) {
        this.__meta__.fields = Fields.create(fields);
    },

    get fields() {
        return this.__meta__.fields;
    },

    get isValidated() {
        return typeof this.__meta__.validated !== undefined;
    },

    get errors() {
        if (!this.__meta__.errors) {
            this.__meta__.errors = _errors(this.__meta__.validated);
        }

        return this.__meta__.errors;
    },

    get renderedFields() {
        var fields = this.isValidated ? this.__meta__.validated : this.fields;

        return _renderedFields(fields);
    },

    get isValid() {
        if (!this.isValidated) return false;

        return _.isEmpty(this.errors);
    },

    validate: function(values, done) {
        var bound = _bind(this.fields, values);

        _validate(bound, bound, function(err) {
            this.__meta__.validated = bound;
            done( err, this);
        }.bind(this));
    }
};

module.exports = {
    create: function(init) {
        var ctor = function() {
            Object.defineProperty(this, '__meta__', {
                writable: true,
                value: {}
            });

            init.apply(this, arguments);
        };

        ctor.prototype = Object.create(proto);

        return ctor;
    }
};