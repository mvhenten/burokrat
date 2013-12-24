'use strict';

var _ = require('lodash'),
    util = require('util'),
    htmlentities = require('escape-html');

function _identify(name, id) {
    if (id === false) return null;
    if (id === true) return 'id_' + name;

    return id;
}

function _sanitize(attrs) {
    return _.reduce(attrs, function(attrs, value, key) {
        if (value === undefined || value === null || value.length === 0) return attrs;
        attrs[key] = value;
        return attrs;
    }, {});
}

function _attributes(attrs) {
    var attributes = _.map(_sanitize(attrs), function(value, key) {
        value = [].concat(value).join(' ');

        return util.format('%s="%s"', key, htmlentities(value));
    });

    return attributes.length ? ' ' + attributes.sort().join(' ') : '';
}

function _tag(name, attrs, body) {
    if (!body) return util.format('<%s%s />', name, _attributes(attrs));
    return [util.format('<%s%s>', name, _attributes(attrs)), body, util.format('</%s>', name)].join('');
}

function _formatValue(value) {
    return value;
}

function _input(type) {
    return function(options) {
        options = options || {};

        var widget = _.defaults(options, {
            classes: options.classes,
            type: type,
            formatValue: _formatValue,
            toHTML: function(name, field, extOptions) {
                field = field || {};

                return _tag('input', _.merge({}, options.attributes, {
                    type: type,
                    name: name,
                    id: _identify(name, field.id || true),
                    classes: options.classes,
                    value: widget.formatValue(field.value)
                }, extOptions));
            },
        });

        return widget;
    };
}

exports.text = _input('text');
exports.email = _input('email');
exports.hidden = _input('hidden');
exports.color = _input('color');
exports.tel = _input('tel');

exports.checkbox = function(options) {
    var widget = _input('checkbox'),
        input = widget(options),
        toHTML = input.toHTML;

    input.toHTML = function(name, field) {
        field = field || {};
        return toHTML(name, field, {
            checked: !! field.value ? 'checked' : null,
            value: 'on'
        });
    };

    return input;
};

exports.password = function(options) {
    var widget = _input('password'),
        input = widget(options);

    input.formatValue = function() {
        return null;
    };

    return input;
};

exports.textarea = function(options) {
    options = options || {};

    var widget = _.defaults(options, {
        classes: options.classes,
        toHTML: function(name, field) {
            field = field || {};

            return _tag('textarea', _.merge({}, options.attributes, {
                name: name,
                id: _identify(name, field.id || true),
                classes: options.classes
            }), htmlentities(field.value));
        },
    });

    return widget;
};

function _normalizeOptions(options) {
    if (_.isArray(options)) {
        if (_.every(options, _.isPlainObject)) {
            return options;
        }

        return _normalizeOptions(_.zipObject(options, options));
    }

    return _.map(options, function(value, key) {
        return _.zipObject([key], [value]);
    });
}

exports.select = function(options) {
    var widget = _input('select'),
        input = widget(options);

    options = options || {};

    input.toHTML = function(name, field) {
        var opts = _normalizeOptions(field.options || field.choices),
            optionElements = _.map(opts, function(option) {
                var name = _.keys(option)[0],
                    value = option[name];

                return _tag('option', {
                    selected: !! (field.value && field.value === value),
                    value: value
                }, htmlentities(name));
            });

        return _tag('select', {
            name: name,
            id: _identify(name, field.id || true),
            classes: options.classes
        }, optionElements.join('\n'));
    };

    return input;
};

//var dateWidget = input('date');
//exports.date = function (opt) {
//    var w = dateWidget(opt);
//    w.formatValue = function (value) {
//        if (!value) {
//            return null;
//        }
//
//        var date = value instanceof Date ? value : new Date(value);
//
//        if (isNaN(date.getTime())) {
//            return null;
//        }
//
//        return date.toISOString().slice(0, 10);
//    };
//    return w;
//};

//exports.multipleCheckbox = function (opt) {
//    if (!opt) { opt = {}; }
//    var w = {
//        classes: opt.classes,
//        type: 'multipleCheckbox'
//    };
//    w.toHTML = function (name, f) {
//        if (!f) { f = {}; }
//        return Object.keys(f.choices).reduce(function (html, k) {
//            // input element
//            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k,
//                checked = Array.isArray(f.value) ? f.value.some(function (v) { return v === k; }) : f.value === k;
//
//            html += singleTag('input', [{
//                type: 'checkbox',
//                name: name,
//                id: id,
//                classes: w.classes,
//                value: k,
//                checked: !!checked
//            }, w.attrs || {}]);
//
//            // label element
//            html += tag('label', {'for': id}, f.choices[k]);
//
//            return html;
//        }, '');
//    };
//    return w;
//};
//
//exports.label = function (opt) {
//    if (!opt) { opt = {}; }
//    var w = {
//        classes: opt.classes || []
//    };
//    w.toHTML = function (forID, f) {
//        return tag('label', [{
//            for: forID,
//            classes: w.classes
//        }, w.attrs || {}], opt.content);
//    };
//    return w;
//};
//
//exports.multipleRadio = function (opt) {
//    if (!opt) { opt = {}; }
//    var w = {
//        classes: opt.classes,
//        type: 'multipleRadio'
//    };
//    w.toHTML = function (name, f) {
//        if (!f) { f = {}; }
//        return Object.keys(f.choices).reduce(function (html, k) {
//            // input element
//            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k,
//                checked = Array.isArray(f.value) ? f.value.some(function (v) { return v === k; }) : f.value === k;
//
//            html += singleTag('input', [{
//                type: 'radio',
//                name: name,
//                id: id,
//                classes: w.classes,
//                value: k,
//                checked: !!checked
//            }, w.attrs || {}]);
//            // label element
//            html += tag('label', {for: id}, f.choices[k]);
//
//            return html;
//        }, '');
//    };
//    return w;
//};
//
//exports.multipleSelect = function (opt) {
//    if (!opt) { opt = {}; }
//    var w = {
//        classes: opt.classes,
//        type: 'multipleSelect'
//    };
//    w.toHTML = function (name, f) {
//        if (!f) { f = {}; }
//        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
//            var selected = Array.isArray(f.value) ? f.value.some(function (v) { return v === k; }) : (f.value && f.value === k);
//            return html + tag('option', {
//                value: k,
//                selected: !!selected
//            }, f.choices[k]);
//        }, '');
//        return tag('select', [{
//            multiple: true,
//            name: name,
//            id: f.id || true,
//            classes: w.classes
//        }, w.attrs || {}], optionsHTML);
//    };
//    return w;
//}
