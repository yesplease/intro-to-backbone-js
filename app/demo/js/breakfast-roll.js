(function() {
  var BreakfastRoll = {};
  window.BreakfastRoll = BreakfastRoll;

  var template = function(name) {
    return Mustache.compile($('#'+name+'-template').html());
  };

  BreakfastRoll.Recipe = Backbone.Model.extend({
    name: function() {
      return this.get('name');
    },

    ingredients: function(){
      return this.get('ingredients');
    }
  });

  BreakfastRoll.Recipes = Backbone.Collection.extend({
    model: BreakfastRoll.Recipe,

    // url: admin/food/recipes -- but they're using local storage here
    localStorage: new Store("recipes")
  });

  BreakfastRoll.Index = Backbone.View.extend({
    template: template('index'),
    initialize: function() {
      this.recipes = new BreakfastRoll.Recipes();
      this.recipes.on('all', this.render, this); // on any event, re-render
      this.recipes.on('all', function(){
        console.log("event on recipes", arguments);
      });
      this.recipes.fetch(); // first thing we do is fetch all the recipes (which triggers the above event)
    },
    render: function() {
      this.$el.html(this.template(this));
      var form = new BreakfastRoll.Index.Form({collection: this.recipes});
      var recipesView = new BreakfastRoll.Index.Recipes({collection: this.recipes})
      this.$('.recipes').append(recipesView.render().el);
      this.$('.recipes').append(form.render().el);
      return this;
    },
    count: function() {
      return this.recipes.length;
    },
  });

  BreakfastRoll.Index.Recipes = Backbone.View.extend({
    render: function(){
      // this.$el.text("Hey recipes go here");
      this.collection.each(function(recipe) {
        var view = new BreakfastRoll.Index.Recipe({model: recipe});
        this.$el.append(view.render().el);

      }, this);
      return this;
    }
  });

  BreakfastRoll.Index.Recipe = Backbone.View.extend({
    template: template('index-recipe'),
    render: function(){
      this.$el.html(this.template(this));
      return this;
    },
    events: {
      "click button": "delete"
    },
    name: function(){ return this.model.name(); },
    ingredients: function(){ return this.model.ingredients(); },
    delete: function(){
      this.model.destroy();
    }
  });


  BreakfastRoll.Index.Form = Backbone.View.extend({
    //now that we've defined a form,
    //we need to listen for an event
    tagName: 'form',
    className: 'form',
    template: template('index-form'),
    events: {
      "submit": "submit"
    },
    render: function(){
      this.$el.html(this.template(this));
      return this;
    },
    submit: function(event){
      event.preventDefault();
      this.collection.create({
        name: this.$('input#name').val(),
        ingredients: this.$('input#ingredients').val()
      });
    }
  });

  /*
   * To do:
   *
   * * BreakfastRoll.Index.Form
   *   A view that renders a form which can be submitted
   *   to create a new recipe
   * * BreakfastRoll.Index should add a subview for each
   *   recipe in the database
   * * BreakfastRoll.Recipe
   *   A view that renders an individual recipe
   *   Also, a delete button to remove it
   */

  BreakfastRoll.Router = Backbone.Router.extend({
    initialize: function(options) {
      this.el = options.el
    },
    routes: {
      "": "index"
    },
    index: function() {
      var view = new BreakfastRoll.Index();
      this.el.empty();
      this.el.append(view.render().el);
    }
  });

  BreakfastRoll.boot = function(container) {
    container = $(container);
    var router = new BreakfastRoll.Router({el: container})
    Backbone.history.start();
  }
})()
