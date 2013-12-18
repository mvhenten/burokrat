burokrat - build forms like a bureaucrat
========================================

### disclaimer

> this software is in beta status. It's missing tests and still needs to be battle
> tested in a real environment.

I like (forms)[https://npmjs.org/package/forms] but not enough. Forms is implemented
in a way that it forces me to keep some state across my controllers, where I prefer
the entire form state to be contained within a single object.

I also prefer my data and forms to be structured as nested objects, so I can loop
over parts of my form and selectively build the entire html by hand. This module
wraps the most usefull parts of forms (for now) and offers an entirely different
API.

Example

```javascript
    var Burokrat = require('burokrat');

    var Form = Burokrat.create(function(args) {
        // you may do some constructor magic here
        // as constructor values are passed to this
        // function...

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
                    label: 'Something about yourself',
                },
                culture: {
                    type: 'select',
                    options: ['nl-NL', 'en-EN'],
                    value: 'nl-NL',
                    required: true,
                    label: 'Select language',
                    validators: []
                },
                password: {
                    type: 'password',
                    required: true,
                    value: args.password,
                    label: 'Password',
                    placeholder: '***',
                    validators: []
                }
            }
        };
    });

    var f = new Form({ password: '!@##' });

    f.validate(function(err, form){
        if( form.isValid ){
            // yay
        }

        console.log(form.errors);
        // gives: { test: 'not a thing', profile: { description: 'This field is required.' }}

        console.log(f.errors);
        // same thing. state is maintained inside the object
    });
```

Bugs
====
Propably some. Main problem: you cannot have form field named `type` at the
moment. This will propably be adressed some day.

License
=======

    Copyright (c) 2013 Matthijs van Henten

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

