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

function _toHTML(fields) {
    return _.reduce(fields, function(collect, field) {
        if (field.type) {
            return collect.concat(field.toHTML());
        }

        return collect.concat(_toHTML(field));
    }, []);
}

function _pluckFields(fields, property) {
    return _.reduce(fields, function(collect, field, name) {
        if (field.type) {
            if (field[property]) {
                collect[name] = field[property];
            }
            return collect;
        }

        var collected = _pluckFields(field, property);

        if (!_.isEmpty(collected)) {
            collect[name] = _pluckFields(field, property);
        }

        return collect;
    }, {});
}

function _fieldHTML(field) {
    var classes = field.classes() || [];

    if (field.error) {
        classes.push('error');
    }

    return {
        get value() {
            return field.value;
        },

        get html() {
            return field.widget.toHTML(field.name, field);
        },

        get errorHTML() {
            return field.errorHTML();
        },

        get labelHTML() {
            return field.labelHTML();
        },

        get widgetHTML() {
            return field.toHTML();
        },

        classes: classes.join(' ')
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

    get values() {
        var fields = this.isValidated ? this.__meta__.validated : this.fields;
        return _pluckFields(fields, 'value');
    },

    get errors() {
        if (!this.__meta__.errors) {
            this.__meta__.errors = _pluckFields(this.__meta__.validated, 'error');
        }

        return _.isEmpty(this.__meta__.errors) ? null : this.__meta__.errors;
    },

    get renderedFields() {
        var fields = this.isValidated ? this.__meta__.validated : this.fields;

        return _renderedFields(fields);
    },

    get isValid() {
        if (!this.isValidated) return false;

        return _.isEmpty(this.errors);
    },

    toHTML: function() {
        var fields = this.isValidated ? this.__meta__.validated : this.fields;

        return _toHTML(fields).join('\n');
    },

    validate: function(values, done) {
        var bound = _bind(this.fields, values);

        _validate(bound, bound, function(err) {
            this.__meta__.validated = bound;

            process.nextTick(_.partial(done, err, this));
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
