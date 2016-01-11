function Join() {
    this.left;
    this.leftDb;
    this.leftKey;
    
    this.right;
    this.rightDb;
    this.rightKey;
    
    this.sql;
}

Join.prototype.between = function(left, leftDb, right, rightDb) {
    this.left = left;
    this.leftDb = leftDb;
    this.right = right;
    this.rightDb = rightDb;
    return this;
}

Join.prototype.on = function(left, right) {
    this.leftKey = left;
    this.rightKey = right;
    return this;
}

Join.equals = function(left, right) {
    return (left.leftDb == right.rightDb && left.left == right.left && left.right == right.right);
}

Join.prototype.equals = function(right) {
    return Join.equals(this, right);
}

Join.prototype.getSQL = function() {
    return `\nLEFT JOIN\n\t\`${this.rightDb}\`.\`${this.right}\` ON (\`${this.leftDb}\`.\`${this.left}\`.\`${this.leftKey}\` = \`${this.rightDb}\`.\`${this.right}\`.\`${this.rightKey}\`)`;
}

exports = module.exports = Join;