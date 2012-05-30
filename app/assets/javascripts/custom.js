App = {

	// a hash for creating new tofu
	newTOFU : {
		group : "",
		recipient_ids : ""
		// priority : optional
	},

	usedKeywords : [],

	init : function(){
		console.log("app init");
		console.log($("#new-tofu-button"));
		$("#new-tofu-button").bind("click", $.proxy(App.createTofu, App) );
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
		var content = $("#micropost_content").val();
		// remove keyword from content
		for (var i = this.usedKeywords.length - 1; i >= 0; i--) {	
			content = content.replace(this.usedKeywords[i] + " ", "");
		};
      	
      	this.newTOFU.content = content;
	}


};

$(document).ready(App.init)