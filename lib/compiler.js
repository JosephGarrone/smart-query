var Join = require('./join.js');
var Select = require('./select.js');

function Compile(SQuery) {
    this.SQuery = SQuery;
    
    this.selects = [];
    this.joins = [];
    
    this.sql;
}

Compile.prototype.compile = function() {
    this.resolveJoinsAndSelects(function() {
        this.selects.forEach(function(select) {
            console.log(`SELECT ${select.database}.${select.table}.${select.table} as ${select.alias}`)
        });
        
        this.joins.forEach(function(join) {
        console.log(`LEFT JOIN ${join.rightDb}.${join.right} ON (${join.leftDb}.${join.left}.${join.leftKey} = ${join.rightDb}.${join.right}.${join.rightKey}`); 
        });
    });
}

/**
 * @description Resolve all the foriegn keys into joins and create the selects
 */
Compile.prototype.resolveJoinsAndSelects = function(finish) {
    var that = this;
    
    // Find all the columns of the table
    that.SQuery.conn.query('SELECT `COLUMN_NAME`, `TABLE_NAME`, `TABLE_SCHEMA` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ?', [that.SQuery.database, that.SQuery.table], function(err, rows, fields) {
        if (err) {
            throw Error(`Internal error:  + ${err}`);
        }
        
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            that.selects.push(new Select().column(row.COLUMN_NAME).from(row.TABLE_NAME, row.TABLE_SCHEMA).as(row.COLUMN_NAME));
        }
        
        // Find all the columns which have foreign keys
        that.SQuery.conn.query('SELECT * FROM `INFORMATION_SCHEMA`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ?', [that.SQuery.database, that.SQuery.table], function(err, rows, fields) {
            if (err) {
                throw Error(`Internal error:  + ${err}`);
            }
            // Check all foreign key rows
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                
                // Find the existing select for that key
                for (var j = 0; j < that.selects.length; j++) {
                    var select = that.selects[j];
                    
                    if (select.equals(new Select().column(row.COLUMN_NAME).from(row.TABLE_NAME, row.TABLE_SCHEMA))) {
                        // Modify the select query
                        select.column(row.REFERENCED_COLUMN_NAME).from(row.REFERENCED_TABLE_NAME, row.REFERENCED_TABLE_SCHEMA);
                        
                        // Join the table
                        var join = new Join().between(row.TABLE_NAME, row.TABLE_SCHEMA, row.REFERENCED_TABLE_NAME, row.REFERENCED_TABLE_SCHEMA).on(row.COLUMN_NAME, row.REFERENCED_COLUMN_NAME);
                        var found = false;
                        for (var k = 0; k < that.joins.length; k++) {
                            var existing = that.joins[k];
                            
                            if (existing.equals(join)) {
                                found = true;
                            }
                        }
                        
                        // If the join doesn't exist, add it
                        if (!found) {
                            that.joins.push(join);
                        }
                        
                        break;
                    }
                }
            }
            
            finish.call(that);
        });
    });
}

exports = module.exports = Compile;