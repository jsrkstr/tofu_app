App.models.Tofu = Backbone.Model.extend({

	defaults : {
		group : "msg",
		priority : "moderate",
		status : "new"
	},


	validate : function(attrs){
		 if(attrs.content == "")
		 	return false;
	},


	initialize : function(args){
		this.set({timestamp : $.timeago(this.get("created_at"))});
		
		//var comments_channel = "add:" + this.id;// listen to channel add:tofu_id
		//App.currentComments.on(comments_channel, this.addComment, this);
	},


	// addComment : function(model){
	// 	this.trigger("add:comment", model);
	// },


	createComment : function(content){

		var recipient_ids = this.get("recipient_ids").split(",");
		var index = recipient_ids.indexOf(App.currentUserId);

		//remove authors id
		if(index != -1)
			recipient_ids.splice(index, 1);

		//add tofu's user id
		var uid = this.get("user_id");
		if(uid != App.currentUserId)
			recipient_ids.push(uid);

		App.currentComments.create({
			group : "comment",
			tofu_id : this.id,
			content : content,
			created_at : new Date(),
			author_id : App.currentUserId,
			recipient_ids : recipient_ids.toString()
		}, {
			wait : true
		});
	}

});