function Select() {
    this.database;
    this.table;
    this.field;
    this.alias;
    this.sql;
}

Select.prototype.column = function(field) {
    this.field = field;
    
    if (!this.alias) {
        this.alias = field;
    }
    
    return this;
}

Select.prototype.from = function(table, database) {
    this.table = table;
    this.database = database;
    return this;
}

Select.prototype.as = function(alias) {
    this.alias = alias;
    return this;
}

Select.equals = function(left, right) {
    return (left.database == right.database && left.table == right.table && left.field == right.field);
}

Select.prototype.equals = function(right) {
    return Select.equals(this, right);
}

Select.prototype.getSQL = function() {
    return `\n\t\`${this.database}\`.\`${this.table}\`.\`${this.field}\` as \`${this.alias}\``;
}

exports = module.exports = Select;