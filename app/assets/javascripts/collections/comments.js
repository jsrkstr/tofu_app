App.collections.Comments = Backbone.Collection.extend({

	url : "/comments",

	initialize : function(args){
		this.on("add", this.dispatch, this); //dispatch comment to corrent tofu
	},


	dispatch : function(comment){
		var channel = "add:"+ comment.get("tofu_id");
		this.trigger(channel, comment);
	},


	comparator : function(model){
		return Date.parse(model.get("created_at"));
	}


});