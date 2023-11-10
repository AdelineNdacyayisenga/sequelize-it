//Model that maps to columns in a databse table named Articles
'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');//library used to format and display published date for each article

module.exports = (sequelize) => {
  class Article extends Sequelize.Model {
    publishedAt() {
      //formated date
      const date = moment(this.createdAt).format('MMMM D, YYYY, h:mma');
      return date;
    }
    shortDescription() {
      const shortDesc = this.body.length > 200 ? this.body.substring(0,200)+ '...' : this.body;
      return shortDesc;
    }
  }
  Article.init({
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: ' "Title" is required'
        }
      }
    },
    author: Sequelize.STRING,
    body: Sequelize.TEXT
  }, { sequelize });

  return Article;
};