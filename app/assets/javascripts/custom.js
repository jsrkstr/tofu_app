App = {

	models : {},

	collections : {},

	views :{},

	// a hash for creating new tofu
	newTOFU : {
		group : "",
		recipient_ids : ""
		// priority : optional
	},
	

	init : function(){
		console.log("app init");

		$("#new-tofu-button").bind("click", $.proxy(App.createTofu, App) );

		$("#tofu_content").keyup($.proxy(function(e){
			if(e.which == 13)
				this.createTofu();
		}, App) );

		$("#disconnect-button").bind("click", $.proxy(App.disconnectUser, App) );

		_.templateSettings = {
		  interpolate : /\{\{(.+?)\}\}/g
		};

		App.sentTofus = new App.collections.Tofus;
		App.sentTofusView = new App.views.Tofus({collection : App.sentTofus});
		$("#sent-tofus").append(App.sentTofusView.render().el);
		App.sentTofus.reset(JSON.parse($("#bootstrapped-tofus").attr("data")));

		App.receivedTofus = new App.collections.Tofus;
		App.receivedTofusView = new App.views.Tofus({collection : App.receivedTofus});
		$("#received-tofus").append(App.receivedTofusView.render().el);
		App.receivedTofus.reset(JSON.parse($("#bootstrapped-received-tofus").attr("data")));
	},


	createTofu : function(){
		this.parseContent();

		this.sentTofus.create(this.newTOFU, {
			wait : true,
			success : function(){
				$("#tofu_content").val("");
			},
			error : function(){
				$("#tofu_content").val("");
			}
		});

	},


	parseContent : function(){

		var data_source = JSON.parse($("#tofu_content").attr("data-source"));
		var allValues = [];
      	var allKeywords = data_source.map(function(i){
      		var s = i.split(",");
      		allValues.push(s[1]);
      		return s[0];
      	});

      	var starting_with_at = /^@/;

      	var content = $("#tofu_content").val();
      	var splits = content.split(" ");

      	for (var i = splits.length - 1; i >= 0; i--) {
      		var keyword = splits[i].substr(1); // eg task, sachin (without @)
      		var index = allKeywords.indexOf(keyword); // index Of Matched Keyword In AllKeywords
      		if(starting_with_at.test(splits[i]) && index != -1){ // eg split[0] = @tast, @sachin
      			content = content.replace(splits[i] + " ", "");
      			this.addTofuAttr(allValues[index], keyword);
      		}
      	}

      	this.addTofuAttr("content", content);
      	this.newTOFU.created_at = new Date();
	},


	addTofuAttr : function(item_type, item_value){
		switch(item_type){
			case "group" : attr = this.newTOFU.group = item_value;
			  break;

			case "priority" : this.newTOFU.priority = item_value;
			  break;

			case "content" : this.newTOFU.content = item_value;
				break;

			default : this.newTOFU["recipient_ids"] += this.newTOFU["recipient_ids"] == ""? item_type : "," + item_type;
			  break;
		}
	},


	connectUser : function(){
		var user_id = $("#connect-button").attr("data-user-id");

		$.ajax({
			url : "/friendships",
			type : "POST",
			data : { friendship : {
				user_id : user_id
			}},
			success : function(){
				console.log("connected");
			},
			error : function(){
				console.log("error in connecting");
			}
		});
	},


	disconnectUser : function(){
		var friendship_id = $("#disconnect-button").attr("data-friendship-id");
		$.ajax({
			url : "/friendships/" + friendship_id,
			type : "DELETE",
			success : function(){
				console.log("disconnected");
			},
			error : function(){
				console.log("error in disconnecting");
			}
		});
	}


};


App.models.Tofu = Backbone.Model.extend({

	defaults : {
		group : "msg",
		priority : "moderate"
	},


	validate : function(attrs){
		 if(attrs.content == "")
		 	return false;
	},


	initialize : function(args){
		this.set({timestamp : $.timeago(this.get("created_at"))});
	}

});


App.collections.Tofus = Backbone.Collection.extend({


	url : "/tofus",

	
	model : App.models.Tofu,


	initialize : function(args){

	},


	comparator : function(model){
		return (new Date(model.get("updated_at"))).getTime();
	}


});


App.views.Tofus = Backbone.View.extend({

	tagName : "ol",

	className : "microposts",

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
		$(this.el).prepend(view.render().el);
	}

});




App.views.Tofu = Backbone.View.extend({

	template : null,

	tagName : "li",


	events : {
		// bind events..
	},


	initialize : function(args){
		this.template =  _.template($("#tofu-template").html());
	},


	render : function(){
		$(this.el).html(this.template(this.model.toJSON())).attr("id", this.model.id);
		return this;
	}

});

	


// It start here...
$(document).ready(App.init)