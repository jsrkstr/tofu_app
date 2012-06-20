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
		"click" : "glitter",
		"click .dropdown-menu" : "onDropDown",
		"click .gratitude" : "onGratitudeClick"
	},

	open : false, // track state of collapsible


	initialize : function(args){
		this.template =  _.template($("#tofu-template").html());
		var channel = "add:" + this.model.id;
		App.currentComments.on( channel, this.onAddComment, this);
		this.commentTemplate = _.template($("#comment-template").html());
		this.model.on("change", this.renderOpen, this);
		this.model.on("change:status", function(){
			this.glitter(true);
		}, this);
	},


	render : function(){
		var json = this.model.toJSON();

		// author model
		var author = App.currentUser.id == json.user_id ? App.currentUser : App.currentFriends.get(json.user_id);

		_.extend(json, {
			labelClasses : {
				"accepted": "info",
				"declined": "danger",
				"done": "success", 
				"new": "info"
			},
			"gravatar_id" : author.get("gravatar_id"),
			"user_name" : author.get("name")
		});
		this.$el.addClass("task-" + json.status);
		$(this.el).html(this.template(json)).attr("id", this.model.id);
		this.checkReminder();
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


	onAddComment : function(model){
		// this.$(".comments").append(this.commentTemplate(model.toJSON()));
		if(!this.isOpen() && App.isMilestone("comments-loaded")){
			// this.$(".collapse").collapse('show');
			// this.glitter(true);
			this.notifyComment();
		}
	},


	onHide : function(e){
		this.$(".accordion-heading").slideDown("fast");
		this.open = false;
		this.model.collection.trigger("closed", this); // pass the view object
	},

	onShow : function(){
		this.$(".accordion-heading").slideUp("fast");	
		this.$(".accordion-heading .buttons .icon-comment").blink({stop:true, hide : true});// if blinking
		this.open = true; 
		this.model.collection.trigger("opened", this); // pass the view object
	},


	show : function(){
		this.$(".collapse").collapse("show");
	},


	hide : function(){
		this.$(".collapse").collapse("hide");
	},


	isOpen : function(){
		return this.open;
	},

	changeTaskStatus : function(e){
		this.model.set({status : $(e.target).attr("class").split("-")[0] }, {silent : true}).save();
		this.createNotification();
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
	},


	notifyComment : function(){
		if(this.isOpen())
			return false;

		var commentIcon = this.$(".accordion-heading .buttons .icon-comment");
		if(commentIcon.length == 0)
			commentIcon = $("<i class='icon-comment'>").prependTo(this.$(".accordion-heading .buttons"));
		commentIcon.blink();
	},


	onDropDown : function(e){
		var mins = parseInt($(e.target).attr("val"));
		var ms = mins * 60 * 1000;
		var time = Date.now() + ms;
		this.setReminder(time);
	},


	checkReminder : function(){
		var time = localStorage.getItem("alarm_time_tofu_" + this.model.id);
		if(time)
			this.setReminder(time);
	},


	//accepts timestamp
	setReminder : function(time){
		var ms = time - Date.now();
		window.setTimeout($.proxy(this.goReminder, this), ms); // set timer
		localStorage.setItem("alarm_time_tofu_" + this.model.id, time); // save in localstorage to handle page relaods
		this.$(".dropdown-toggle").hide();
		this.$(".btn-group").prepend('<a class="faker btn btn-warning" href="javascript:void(0)" disabled >Reminder Set</a>');
	},


	goReminder : function(){
		this.glitter(true);
		this.$(".dropdown-toggle").show();
		this.$(".faker").remove();
		localStorage.removeItem("alarm_time_tofu_" + this.model.id); // remove from localstorage
	},


	onGratitudeClick : function(){
		this.model.createComment("Thank You!");
	},


	createNotification : function(){
		switch(this.model.get("status")){
			case "accepted" : this.model.createComment("Accepted this task!");
				break;
			case "declined" : this.model.createComment("Declined this task!");
				break;
			case "done": this.model.createComment("Completed this task!");
				break;
		}
	}

});