const moment = require('moment');
module.exports = function(sequelize,DataTypes) {
  let action = sequelize.define('action', {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      isUnique: true
    },
    timestamps: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: function() {
        return moment().valueOf();
      },
      get : function() { // convert createdAt to timestamps
        return this.getDataValue('timestamps');
      }
    }
  });
  return action;
}
