Toolkit
==============================
    
URL Utils
------------------------------
    
.. raw:: html

    <table class="table table-striped table-bordered">
        <tbody>
            <tr>
                <td>Toolkit.getUrlParams(url);</td>
                <td>Returns all URL get params as an object. If no URL is passed, it will use window.location.</td>
            </tr>
            <tr>
                <td>Toolkit.replaceUrlParams(param, value, url);</td>
                <td>Replaces a url parameter with the value and returns a full query string of all the url parameters. Example return <code>?foo=blah&amp;test=7</code>. You can optionally just pass the first argument <code>param</code> as an object of keys pointing to the values you would like to replace. The <code>url</code> argument is optional as well, if not passed it will use window.location. This does not modify the browsers current url.</td>
            </tr>
            <tr>
                <td>Toolkit.deleteUrlParams(param);</td>
                <td>Deletes a url parameter from the current url string and returns the full query string. Param can optionally be an array of keys or an object whos keys will be used for removal. This does not modify the browsers current url. </td>
            </tr>
            <tr>
                <td>Toolkit.objToUrlParamsString(obj);</td>
                <td>Takes an object and returns it as a full query string. Example return <code>?foo=blah&amp;test=7</code>.</td>
            </tr>
        </tbody>
    </table>


String Prototypes and Functions
------------------------------------------------
    
.. raw:: html
    
    <table class="table table-striped table-bordered">
        <tbody>
            <tr>
                <td>String.prototype.trim()</td>
                <td>Trims whitespace off the front and back of a string.</td>
            </tr>
            <tr>
                <td>String.prototype.toCamel()</td>
                <td>CamelCases a string.</td>
            </tr>
            <tr>
                <td>String.prototype.toDash()</td>
                <td>Converts a camel cased, underscored, or spaced string to a dashed string.</td>
            </tr>
            <tr>
                <td>String.prototype.toUnderscore()</td>
                <td>Converts a camel cased, dashed, or spaced string to an underscored string.</td>
            </tr>
            <tr>
                <td>String.prototype.toClassName()</td>
                <td>Converts a string into a camel cased and capitalized class name.</td>
            </tr>
            <tr>
                <td>String.random(length)</td>
                <td>Generates a random string of specified length from numbers, lower, and uppercase letters. Default length is 32. Note that this is not a prototyped function and should be called directly on String. <code>String.random(64);</code>. This is useful for generating random IDs to be inserted into the DOM.</td>
            </tr>
        </tbody>
    </table>
    <div class="bs-docs-example">
        <h3 id="string-test">Hello World from Primer</h3>
        <div id="string-test-btns" class="btn-group">
            <a href="#" class="btn btn-primary" data-func="toCamel">camelCaseIt</a>
            <a href="#" class="btn btn-primary" data-func="toDash">dash-it</a>
            <a href="#" class="btn btn-primary" data-func="toUnderscore">underscore_it</a>
            <a href="#" class="btn btn-primary" data-func="toClassName">ClassNameIt</a>
        </div>
        <a id="string-random-btn" href="#" class="btn btn-success" data-func="random">Randomize It</a>
        <script type="text/javascript">
            $(function(){
                var stringText = $('#string-test');
                $('#string-test-btns a, #string-random-btn').on('click', function(e){
                    e.preventDefault();
                    var val = stringText.text();
                    switch($(this).data('func')) {
                        case 'toCamel':
                            val = val.toCamel();
                            break;
                        case 'toDash':
                            val = val.toDash();
                            break;
                        case 'toUnderscore':
                            val = val.toUnderscore();
                            break;
                        case 'toClassName':
                            val = val.toClassName();
                            break;
                        case 'random':
                            val = String.random(32);
                            break;
                    }
                    stringText.text(val);
                });
            });
        </script>
    </div>

Array Prototypes and Functions
--------------------------------------------
    
.. raw:: html

    <table class="table table-striped table-bordered">
        <tbody>
            <tr>
                <td>Array.prototype.indexOf(value)</td>
                <td>A poly fill for older browsers that don't support this method. It is only added if not present.</td>
            </tr>
            <tr>
                <td>Array.prototype.diff(array)</td>
                <td>Diff two arrays. Will give you the results the arrays don't have in common. <code>arrayOne.diff(arrayTwo);</code></td>
            </tr>
            <tr>
                <td>Array.prototype.subtract(array)</td>
                <td>Subtract all items in the passed array from the calling one.. <code>arrayOne.subtract(arrayTwo);<code></td>
            </tr>
        </tbody>
    </table>

Misc Functions
--------------------------------------------

.. raw:: html
    
    <table class="table table-striped table-bordered">
        <tbody>
            <tr>
                <td>Math.between(min, max, round)</td>
                <td>Returns a number between and including min and max. Returns a float by default unless you pass round as true.</td>
            </tr>
        </tbody>
    </table>
