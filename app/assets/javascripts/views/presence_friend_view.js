App.views.PresenceFriend = Backbone.View.extend({

	tagName : "li",

	events : {
	},


	initialize : function(args){
		this.model.on("change:online", this.onChange, this);
		this.template = _.template($("#presence-friend-template").html());
	},


	render : function(){
		$(this.el).html(this.template(this.model.toJSON()));
		this.$("img").tooltip({
			placement : "left"
		});
		return this;
	},


	onChange : function(model, online){
		if(!online)
			this.remove();
	}

});
	