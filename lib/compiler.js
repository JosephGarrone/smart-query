// 
var Promise = require('promise');

var Join = require('./join.js');
var Select = require('./select.js');

function Compile(SQuery) {
    this.SQuery = SQuery;
    
    this.selects = [];
    this.joins = [];
    
    this.table;
    this.database;
    
    this.sql;
}

/**
 * @description Compile the SQL statement
 */
Compile.prototype.compile = function() {
    var that = this;
    
    this.table = this.SQuery.table;
    this.database = this.SQuery.database;
    
    return this.resolveJoinsAndSelects().then(function() {
        return that.resolveQuery();
    }, function(err) {
        throw err;
    });
}

/**
 * @description Resolve all the foriegn keys into joins and create the selects
 */
Compile.prototype.resolveJoinsAndSelects = function(finish) {
    var that = this;
    
    return new Promise(function (accept, reject) {
        // Find all the columns of the table
        that.SQuery.conn.query('SELECT `COLUMN_NAME`, `TABLE_NAME`, `TABLE_SCHEMA` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ?', [that.database, that.table], function(err, rows, fields) {
            if (err) {
                reject(Error(`Internal error:  + ${err}`));
            }
            
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                that.selects.push(new Select().column(row.COLUMN_NAME).from(row.TABLE_NAME, row.TABLE_SCHEMA).as(row.COLUMN_NAME));
            }
            
            // Find all the columns which have foreign keys
            that.SQuery.conn.query('SELECT * FROM `INFORMATION_SCHEMA`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ? AND `REFERENCED_TABLE_SCHEMA` IS NOT NULL', [that.database, that.table], function(err, rows, fields) {
                if (err) {
                    reject(Error(`Internal error:  + ${err}`));
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
                            
                            // Construct the join
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
                
                accept();
            });
        });
    });
}

/**
 * @description Compile the SQL statement
 */
Compile.prototype.resolveQuery = function() {
    var that = this; 
    
    that.sql = 'SELECT';
    
    // Select all the columns
    var joins = [];
    that.selects.forEach(function(select) {
        joins.push(select.getSQL());
    });
    that.sql += joins.join(',');
    
    // Add the from clause
    that.sql += `\nFROM\n\t\`${that.database}\`.\`${that.table}\``;
    
    // Add all the joins
    joins = []
    that.joins.forEach(function(join) {
        joins.push(join.getSQL()); 
    });
    that.sql += joins.join('');
    
    // Add the where clause
    that.sql += '\nWHERE 1';
    
    // Add limits
    var limit = that.SQuery.limit;
    if (limit.enabled) {
        that.sql += `\nLIMIT ${limit.offset}, ${limit.limit}`;
    }
    
    return that.sql;
}

exports = module.exports = Compile;