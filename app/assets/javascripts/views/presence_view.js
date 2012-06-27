App.views.Presence = Backbone.View.extend({

	el : "#presence-sidebar",

	events : {
		// "click li" : ""
	},


	initialize : function(args){
		this.$el.appendTo($("body"));
		this.collection.on("change:online", this.onChange, this);
		this.render();
	},


	render : function(){
		this.addAll();
		this.renderStats();

		setTimeout(function(){
			$("#presence-sidebar .nano").nanoScroller();
		}, 500);

		return this;
	},


	addAll : function(){
		var onlineFriends = this.collection.filter(function(friend){
			return friend.get("online") || false;
		});

		_.each(onlineFriends, function(model){
			this.addOne(model);
		}, this);
	},


	addOne : function(model){
		var view = new App.views.PresenceFriend({ model : model });
		this.$el.hide();
		this.$(".content").append(view.render().el);
		this.$el.slideDown("slow");
	},


	renderStats : function(){
		var onlineFriends = this.collection.filter(function(friend){
			return friend.get("online") || false;
		});

		var count = onlineFriends.length;
		this.$("#online-frnd-count").html(count + " Friends Online");
	},


	onChange : function(model, online){
		if(online)
			this.addOne(model);

		$("#presence-sidebar .nano").nanoScroller();
		this.renderStats();
	}

});
			