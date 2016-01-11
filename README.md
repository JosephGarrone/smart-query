# smart-query
## Installation

Smart query can be installed via:

`npm install smart-query`

## Usage

More examples will be added later, but for the time being the following shows how to use it:

```
var SQuery = require('smart-query');

SQuery.from('table_name').resolve(function(data) {
    console.log(data);
});
```
This will output an array of results from the specified table.