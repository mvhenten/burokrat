'use strict';

var Validate = require('./validate'),
    util = require('util'),
    _ = require('lodash');

function _name(fields, prefix) {
    return _.reduce(fields, function(collect, field, key) {
        var name = prefix ? util.format('%s[%s]', prefix, key) : key;

        if (field.type && !_.isString(field.type)) {
            throw new Error('Sanity check: you cannot have "type" as a field collection:', field);
        }

        if (field.type) {
            field.name = name;
            collect[key] = field;
            return collect;
        }

        collect[key] = _name(field, name);
        return collect;
    }, {});
}

function _choices(options) {
    if (_.isArray(options)) {
        return options.reduce(function(collect, value) {
            collect[value + ''] = value;
            return collect;
        }, {});
    }

    return options;
}

function _field(field, map) {
    var item = _.clone(field);

    if (item.options) {
        item.choices = _choices(item.options);
        item.validators = [Validate.options(item.error || item.label || 'invalid option')].concat(item.validators || []);
        item.error = null;
    }

    if (typeof item.required === 'string') {
        item.validators = [Validate.required(item.required)].concat(item.validators || []);
        item.required = null;
    }

    return map.field(_.defaults(item, {
        errorAfterField: true,
        widget: map.widget({
            classes: field.classes,
            placeholder: field.placeholder
        }),
        cssClasses: {
            label: field.labelClasses
        }
    }));
}

function _fields(fields, form) {
    return _.reduce(fields, function(collect, value, key) {
        if (value.type) {
            collect[key] = _field(value, form.widgets(value.type));
            return collect;
        }

        collect[key] = _fields(value, form);
        return collect;
    }, {});
}

module.exports = {
    create: function(fields, form) {
        return _name(_fields(fields, form));
    }
};
