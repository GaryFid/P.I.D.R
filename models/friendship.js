const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Friendship = sequelize.define('Friendship', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'accepted', 'rejected']]
        }
    },
    requestedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    respondedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'friendships',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'friendId']
        }
    ]
});

module.exports = Friendship; 