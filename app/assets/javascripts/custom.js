App = {

	models : {},

	collections : {},

	views :{},

	commands : [
		{ name : "task" , 		type : "group" },
		{ name : "reminder" , 	type : "group" },
		{ name : "msg" , 		type : "group" },
		{ name : "question" , 	type : "group" },
		{ name : "high", 		type : "priority" },
		{ name : "low" , 		type : "priority" },
		{ name : "moderate", 	type : "priority" }
	],

	milestones : {}, // track application milestones
	

	init : function(){
		console.log("app init");

		App.currentUserId = $("meta[name=user_id]").attr("content");

		App.env = $("meta[name=env]").attr("content");

		$("#connect-button").bind("click", $.proxy(App.connectUser, App) );
		$("#disconnect-button").bind("click", $.proxy(App.disconnectUser, App) );

		_.templateSettings = {
		  interpolate : /\{\{\=(.+?)\}\}/g,
		  evaluate : /\{\{(.+?)\}\}/g
		};


		App.currentComments = new App.collections.Comments();

		App.sentTofus = new App.collections.Tofus;
		App.sentTofusView = new App.views.Tofus({collection : App.sentTofus});
		$("#sent-tofus").append(App.sentTofusView.render().el);
		App.sentTofus.reset(JSON.parse($("#bootstrapped-tofus").attr("data")));

		App.receivedTofus = new App.collections.Tofus;
		App.receivedTofusView = new App.views.Tofus({collection : App.receivedTofus});
		$("#received-tofus").append(App.receivedTofusView.render().el);
		App.receivedTofus.reset(JSON.parse($("#bootstrapped-received-tofus").attr("data")));


		var socketUrl = App.env == "development"? 'http://lh:3001' : 'http://tofuapp.cloudno.de';
		App.socket = io.connect(socketUrl);

		App.socket.on('connect', function () {
			App.socket.emit("register", App.currentUserId, function(d){
				console.log("connected to socket", d);
				App.socket.emit("history", "comments", function(d){
					App.currentComments.add(d);
					App.markMilestone("comments-loaded");
				});
			});
		});

		App.socket.on("message", function(data){
			switch(data.group) {// its a tofu
				case "comment" : App.currentComments.add(data);
					break;

				default : if(App.sentTofus.get(data.id)) // updated
							App.sentTofus.forceAdd(data);
						else //new
							App.receivedTofus.add(data);
			}
		});

		//App.setupTofuForm();

		App.currentCommandLine = new App.views.CommandLine();

	},


	// setupTofuForm : function(){

	// 	var items = App.currentFriends.toJSON().concat(App.commands);
	// 	$("#jx-tofu_content").typeahead({ source : items, items : 4 });
	// 	$(".jx-tofu-form").bind("submit", $.proxy(App.createTofu, App) );
	// 	$("#jx-new-tofu-button").click($.proxy(App.createTofu, App) );
	// },


	createTofu : function(){
		var attrs = this.parseContent();

		this.sentTofus.create(attrs, {
			wait : true,
			success : function(){
				$("#jx-tofu_content").val("");
			},
			error : function(){
				$("#jx-tofu_content").val("");
			}
		});

	},


	parseContent : function(){

		var allFriends = App.currentFriends.reduce(function(memo, item){
			memo[item.get("name")] = item.id;
			return memo;
		}, {});

		var allCommands = _.reduce(App.commands, function(memo, item){
			memo[item.name] = item.type;
			return memo;
		}, {});

		var attrs = {
			recipient_ids : [],
			group : ""
		};

      	var starting_with_at = /^@/;

      	var content = $("#jx-tofu_content").val();
      	var splits = content.split(" ");

      	for (var i = splits.length - 1; i >= 0; i--) {
      		var keyword = splits[i].substr(1); // eg task, sachin (without @)

      		if(starting_with_at.test(splits[i])){

	      		if(allFriends[keyword]){
	      			attrs.recipient_ids.push(allFriends[keyword]); // push friend id
	      		} else if(allCommands[keyword]){
	      			attrs.group = keyword;
	      		}

	      		content = content.replace(splits[i] + " ", "");
	      	}
      	}

      	attrs.content = content;
      	attrs.created_at = new Date();
      	attrs.recipient_ids = attrs.recipient_ids.toString();

      	return attrs;
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
	},


	markMilestone : function(what){
		this.milestones[what] = true;
	},


	isMilestone : function(which){
		return this.milestones[which] || false;
	}


};


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




App.views.Tofu = Backbone.View.extend({

	template : null,

	tagName : "div",

	className : "accordion-group",


	events : {
		//"click i" : "toggleInput",
		"submit .comment-form" : "createComment",
		"hide" : "onHide",
		"show" : "onShow",
		"click .accepted-task, .declined-task, .done-task" : "changeTaskStatus",
		"click" : "glitter"
	},

	open : false, // track state of collapsible


	initialize : function(args){
		this.template =  _.template($("#tofu-template").html());
		// this.model.on("add:comment", this.addComment, this);
		this.commentTemplate = _.template($("#comment-template").html());
		this.model.on("change", this.renderOpen, this);
		this.model.on("change:status", function(){
			this.glitter(true);
		}, this);
	},


	render : function(){
		$(this.el).html(this.template(this.model.toJSON())).attr("id", this.model.id);
		return this;
	},


	renderOpen : function(){
		this.render();
		// this.$(".collapse").collapse("show");
	},


	createComment : function(){
		this.model.createComment(this.$(".comment-box").val());
		this.$(".comment-box").val("");
	},


	// addComment : function(model){
	// 	this.$(".comments").append(this.commentTemplate(model.toJSON()));
	// 	if(!this.isOpen() && App.isMilestone("comments-loaded")){
	// 		this.$(".collapse").collapse('show');
	// 		this.glitter(true);
	// 	}
	// },


	// toggleInput : function(e){
	// 	if(!$(e.target).hasClass("comment-box"))
	// 		this.$("input").slideToggle(100);
	// },


	onHide : function(e){
		this.$(".accordion-heading").slideDown("fast");
		this.open = false;
		this.model.collection.trigger("closed", this); // pass the view object
	},

	onShow : function(){
		this.$(".accordion-heading").slideUp("fast");	
		this.open = true; 
		this.model.collection.trigger("opened", this); // pass the view object
	},

	isOpen : function(){
		return this.open;
	},

	changeTaskStatus : function(e){
		this.model.set({status : $(e.target).attr("class").split("-")[0] }, {silent : true}).save();
	},

	glitter : function(arg){
		this.glittering = arg == true ? true : false;
		if(this.glittering)
			this.glitterAnimate("1"); // start
	},

	glitterAnimate : function(val){
		$(this.el).animate({
			'border-color-oo': val
		},
		{
			duration : "slow",
			complete : $.proxy(function(){
				if(this.glittering)
					this.glitterAnimate($(this.el).css("box-shadow") == "none"? "1" : "0.3");
				else
					$(this.el).css({'border-color': '#E5E5E5', 'box-shadow': 'none'});
			}, this),
			step: function(now, fx) {
				$(fx.elem).css({'border-color': 'rgba(82, 168, 236, '+ now +')', 'box-shadow': 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 ' + now*20 +'px rgba(82, 168, 236, 0.6)'});
				if(now == 0.3)
					$(fx.elem).css({'box-shadow': 'none'});
			}
		});	
	}

});



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



App.views.CommandLine = Backbone.View.extend({

	el : "#command-line",

	events : {
		// "click .jx-hide" : "cons"
	},


	initialize : function(args){
		this.$el.jixedbar();

		App.receivedTofus.on("opened", this.loadComments, this);
		App.sentTofus.on("opened", this.loadComments, this);
		// App.receivedTofus.on("closed", this.unloadComments, this);
		// App.sentTofus.on("closed", this.unloadComments, this);

		this.commentTemplate = _.template($("#comment-template").html());

		// cnt use in events, as this button is added on the fly
		$(".jx-hide").parent().click($.proxy(function(){
			this.previousState = this.state;
			this.closeComments(50);
		}, this)); 

		$("#jx-uhid-itm-id").click($.proxy(function(){
			window.setTimeout($.proxy(function(){
				if(this.previousState == "open")
				this.openComments();
			}, this), 370);
		}, this)); 
	},


	render : function(){
		// do something...
		return this;
	},


	loadComments : function(view){
		this.unloadComments(); // unload previously loaded comments
		var comments = App.currentComments.filter(function(comment){
			return comment.get("tofu_id") == view.model.id;
		});

		if(comments.length != 0 )
			_.each(comments, this.addComment, this);
		else
			this.closeComments();


		this.currentTofuChannel = "add:" + view.model.id; // channel for a tofu's comments
		App.currentComments.on(this.currentTofuChannel, this.addComment, this);
	},


	unloadComments : function(view){
		this.$("#cmd-chat").empty();
		App.currentComments.off(this.currentTofuChannel || "fakechannel"); // stop listening on for loaded tofu's channel
	},


	addComment : function(comment){
		this.$("#cmd-chat").append(this.commentTemplate(comment.toJSON()));
		this.openComments();
	},


	openComments : function(options){
		this.$("#cmd-chat").slideDown(options || "fast");
		this.state = "open";
	},


	closeComments : function(options){
		this.$("#cmd-chat").slideUp(options || "fast");
		this.state = "close";
	},


	isOpen : function(){
		return this.state == "open" ? true : false ;
	}

});
	


	


// It start here...
$(document).ready(App.init)