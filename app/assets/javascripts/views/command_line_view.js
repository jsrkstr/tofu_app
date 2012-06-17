App.views.CommandLine = Backbone.View.extend({

	el : "#command-line",

	events : {
		"submit .jx-tofu-form" : "onFormSubmit",
		"click #jx-new-tofu-button" : "onFormSubmit"
		// "keydown #jx-tofu_content" : "checkToUnload"
	},


	initialize : function(args){
		this.$el.appendTo("body").jixedbar();

		App.receivedTofus.on("opened", this.loadTofu, this);
		App.sentTofus.on("opened", this.loadTofu, this);
		App.receivedTofus.on("closed", this.unloadTofu, this);
		App.sentTofus.on("closed", this.unloadTofu, this);

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


		var items = App.currentFriends.toJSON().concat(App.commands);
		var input = this.$("#jx-tofu_content");
		input.typeahead({ source : items, items : 4 });
		input.keydown($.proxy(this.checkToUnload, this)); // typeahead unbinds any event after it reloads above
		

		// TODO fix, use display none !important
		this.on("change:tofu", function(isLoaded){
			if(isLoaded)
				$(".typeahead").css("opacity", "0"); // no type ahead in case of comments
			else
				$(".typeahead").css("opacity", "1");
		}, this);

		// this feature will lead to sorting problems
		// this.$("#jx-tofu_content").bind('keyup', jwerty.event('↑', this.loadPrevious, this));
		// this.$("#jx-tofu_content").bind('keyup', jwerty.event('↓', this.loadNext, this));
	},


	loadTofu : function(view){
		//this.unloadComments(); // unload previously loaded comments
		var comments = App.currentComments.filter(function(comment){
			return comment.get("tofu_id") == view.model.id;
		});

		if(comments.length != 0 ){
			_.each(comments, this.addComment, this);
			this.$("#cmd-chat ul").animate({scrollTop : "1000"});
		} else {
			this.openComments();
		}


		this.currentTofuChannel = "add:" + view.model.id; // channel for a tofu's comments
		App.currentComments.on(this.currentTofuChannel, this.onRealtimeComment, this);

		view.$(".collapse").one("shown", $.proxy(function(){ // mark as loaded only after animation complete
			this.loadedTofuView = view;
			console.log(Date.now());
		}, this));
		
		this.trigger("change:tofu", true);
		this.$("#jx-tofu_content").focus();
	},


	unloadTofu : function(view){
		this.$("#cmd-chat ul").empty();
		App.currentComments.off(this.currentTofuChannel || "fakechannel", this.onRealtimeComment); // stop listening on for loaded tofu's channel
		this.loadedTofuView = undefined;
		this.trigger("change:tofu", false);
	},


	isTofuLoaded : function(){
		return this.loadedTofuView ? true : false;
	},

	// this feature will lead to sorting problems

	// loadNext : function(){
	// 	if(this.isTofuLoaded()){
	// 		var model = this.loadedTofuView.model;
	// 		var index = model.collection.indexOf(model)
	// 		var view = model.collection.at(index -1).view;
	// 		if(view){
	// 			this.loadedTofuView.hide();// as in case of view.show, the prevvious one is not being hidden( bug in bootstrap)
	// 			view.show();
	// 		}
	// 	}
	// 	// else {
	// 	// 	console.log("no tofu loaded");// as another animation is on or no tofu loaded
	// 	// }
	// },


	// loadPrevious : function(){
	// 	if(this.isTofuLoaded()){
	// 		var model = this.loadedTofuView.model;
	// 		var index = model.collection.indexOf(model)
	// 		var view = model.collection.at(index + 1).view;
	// 		if(view){
	// 			this.loadedTofuView.hide();
	// 			view.show();
	// 		}
	// 	}
	// },


	// loadLeft : function(){
	// 	if(this.isTofuLoaded()){
	// 		var model = this.loadedTofuView.model;
	// 		var index = model.collection.length - model.collection.indexOf(model)
	// 		var view = model.collection.at(index -1).view;
	// 		if(view){
	// 			this.loadedTofuView.hide();// as in case of view.show, the prevvious one is not being hidden( bug in bootstrap)
	// 			view.show();
	// 		}
	// 	}
	// },


	// loadRight : function(){

	// },



	onRealtimeComment : function(comment){
		this.addComment(comment);
		this.$("#cmd-chat ul").animate({scrollTop : "1000"});
	},


	addComment : function(comment){
		this.$("#cmd-chat ul").append(this.commentTemplate(comment.toJSON()));
		this.openComments();
	},


	openComments : function(options){
		if(this.state != "open"){
			this.$("#cmd-chat").slideDown(options || "fast");
			this.state = "open";
		}
	},


	closeComments : function(options){
		if(this.state != "close"){
			this.$("#cmd-chat").slideUp(options || "fast");
			this.state = "close";
		}
	},


	isOpen : function(){
		return this.state == "open" ? true : false ;
	},


	checkToUnload : function(e){
		if(e.which == 8 && this.$("#jx-tofu_content").val() == "" && this.isTofuLoaded()){ // backspace
			this.loadedTofuView.hide();//this.popCommandParam();
			this.closeComments();
		}
	},


	// popCommandParam : function(){
	// 	return this.commandParams.pop;
	// },


	// pushCommandParam : function(param){
	// 	return this.commandParams.push(param);
	// },


	onFormSubmit : function(){
		var command = this.parseContent();
		this.processCommand(command[0], command[1])
	},


	processCommand : function(action, data){

		switch(action) {

			case "task" : 
			case "msg" : 
			case "question" : 	App.sentTofus.create(data, {
									wait : true,
									success : $.proxy(function(){
										this.flash("success", "Tofu created");
									}, this),
									error : $.proxy(function(){
										this.flash("error", "Error in creating Tofu");
									}, this),
								});
				break;
			case "comment" : this.loadedTofuView.model.createComment(data);
							this.flash();
				break;
		}

	},


	parseContent : function(){

		var content = this.$("#jx-tofu_content").val();

		if(this.isTofuLoaded())
			return ["comment", content];

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

      	return [attrs.group, attrs];
	},


	flash : function(type, message){
		console.log("flash");
		this.$("#jx-tofu_content").val("");
	}

});