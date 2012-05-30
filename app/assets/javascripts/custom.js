App = {

	// a hash for creating new tofu
	newTOFU : {
		group : "",
		recipient_ids : ""
		// priority : optional
	},
	

	init : function(){
		console.log("app init");
		console.log($("#new-tofu-button"));
		$("#new-tofu-button").bind("click", $.proxy(App.createTofu, App) );
		$("#connect-button").bind("click", $.proxy(App.connectUser, App) );
		$("#disconnect-button").bind("click", $.proxy(App.disconnectUser, App) );
	},


	createTofu : function(){
		this.parseContent();

		$.ajax({
			url : "/tofus",
			type : "POST",
			data : {
				tofu : this.newTOFU
			},
			success : function(){
				console.log("created");
			},
			error : function(){
				console.log("error");
			}
		})

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


// It start here...
$(document).ready(App.init)