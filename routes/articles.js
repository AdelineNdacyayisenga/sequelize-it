const express = require('express');
const router = express.Router();
const Article = require('../models').Article;//access the article model

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      //next(error);

      //internal server error
      res.status(500).send(error);//if error is throw from the try block or any of the handler functions
    }
  }
}

/* GET articles listing. */
router.get('/', asyncHandler(async (req, res) => {
  const articles = await Article.findAll({
    order: [['createdAt', 'DESC']]
  });
  res.render("articles/index", { articles, title: "Sequelize-It!" }); // or articles: articles
}));

/* Create a new article form. */
router.get('/new', (req, res) => {
  res.render("articles/new", { article: {}, title: "New Article" });
});

/* POST create article. */
router.post('/', asyncHandler(async (req, res) => {
  let article;
  try {
    //create rows in the database (first console req.body)
    article = await Article.create(req.body); //newly created article
    res.redirect("/articles/" + article.id);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      article = await Article.build(req.body);
      res.render("articles/new", {article, errors: error.errors, title: "New Article"})
    } else {
      throw error; //error caught in the asyncHandler's catch block (not validation error)
    }
  }

}));

/* Edit article form. */
router.get("/:id/edit", asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.id);//article to edit
  if (article) {
    res.render("articles/edit", { article: article, title: "Edit Article" });
  } else {
    res.sendStatus(404);
  }

}));

/* GET individual article. */
router.get("/:id", asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.id);
  if (article) {
    res.render("articles/show", { article: article, title: article.title });
  } else {
    res.sendStatus(404); //if article doesn't exist, send a 404 status to the client
  }

}));

/* Update an article. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let article 
  try{
    article = await Article.findByPk(req.params.id);
    if (article) {
      await article.update(req.body);
      res.redirect("/articles/" + article.id);
    } else {
      res.sendStatus(404);
    }
  } catch(error) {
    if(error.name === 'SequelizeValidationError'){
      article = await Article.build(req.body);
      article.id = req.params.id; //make sure the correct article get updated
      res.render("articles/edit", {article, errors: error.errors, title: "Edit Article"})
    } else {
      throw error;
    }
  }
  
}));

/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.id);
  if (article) {
    res.render("articles/delete", { article, title: "Delete Article" });
  } else {
    res.sendStatus(404);
  }
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.id);
  if (article) {
    await article.destroy();
    res.redirect("/articles");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;