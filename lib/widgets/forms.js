'use strict';

var forms = require('forms'),
    _ = require('lodash');

var fields = forms.fields,
    widgets = forms.widgets;

var _mapping = {
    select: {
        field: fields.string,
        widget: widgets.select
    },
    text: {
        field: fields.string,
        widget: widgets.text
    },
    password: {
        field: fields.string,
        widget: widgets.password
    },
    textarea: {
        field: fields.string,
        widget: widgets.textarea
    },
    radiobuttons: {
        field: fields.string,
        widget: widgets.multipleRadio
    },
    hidden: {
        field: fields.string,
        widget: widgets.hidden
    },
    checkbox: {
        field: fields.boolean,
        widget: widgets.checkbox
    }
};

module.exports = function(name) {
    return _.clone(_mapping[name]);
};
