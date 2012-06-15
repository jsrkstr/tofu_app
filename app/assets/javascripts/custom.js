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




// It start here...
$(document).ready(App.init)