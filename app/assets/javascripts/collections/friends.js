App.collections.Friends = Backbone.Collection.extend({


	url : "/friends",


	initialize : function(args){
		// this.fetch
		// do something...
	},


	comparator : function(model){
		return model;
	}


});