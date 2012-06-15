App.collections.Tofus = Backbone.Collection.extend({


	url : "/tofus",

	
	model : App.models.Tofu,


	initialize : function(args){

	},


	comparator : function(model){
		return (new Date(model.get("updated_at"))).getTime();
	},

	// add even if there is one existing
	forceAdd : function(model){
		var tofu = this.get(model.id);
		if(tofu){
			tofu.set(model);
		} else{
			this.add(model);
		}
	}


});