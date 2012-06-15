App.views.Tofus = Backbone.View.extend({

	tagName : "div",

	className : "tofus",

	events : {
		
	},


	initialize : function(args){
		this.collection.bind("reset", this.addAll, this);
		this.collection.bind("add", this.addOne, this);
	},


	render : function(){
		// do something...
		this.addAll();
		return this;
	},


	addAll : function(){
		this.collection.each(function(model){
			this.addOne(model);
		}, this);
	},


	addOne : function(model){
		var view = new App.views.Tofu({model : model});
		var el = view.render().el;
		$(el).hide();
		$(this.el).prepend(el);
		$(el).slideDown("slow");
	}

});