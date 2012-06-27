class TofusController < ApplicationController
  before_filter :signed_in_user

  # respond_to :json

  def create
    # TODO send error on failure to save and send JSON instead of js
  	@tofu = current_user.tofus.build(params[:tofu])


  	if @tofu.save

      # send to all recipients
      recipient_ids = @tofu.recipient_ids.to_s.split(","); #convert to array after it is saved as string
      # json = ActiveSupport::JSON

      # Constants
      if Rails.env == "development"
        realtime_server_pub_url = "http://lh:3001/publish"
      else
        realtime_server_pub_url = "http://tofuapp.cloudno.de/publish"
      end

      EM.run do
        http = EM::HttpRequest.new(realtime_server_pub_url).post :body => { "recipient_ids" => recipient_ids, "message" => @tofu.to_json}
        http.callback {
          EM.stop
        }
        http.errback {
          EM.stop
        }
      end

      # respond_with @tofu
  	else
  		# respond_with @tofu
  	end

    respond_to do |format|
      format.json { render :json => @tofu }
    end


  end


  def update
    @tofu = Tofu.find(params[:id])    

    if @tofu.update_attributes(params[:tofu])

      # send to all recipients

      recipient_ids = @tofu.recipient_ids.to_s.split(","); #convert to array after it is saved as string

      if @tofu.user_id != current_user.id

        # remove current user from recipients
        recipient_ids.delete_if { |item|      
          current_user.id.to_s == item
        }

        # add author
        recipient_ids.push(@tofu.user_id.to_s)
      end


      # Constants
      if Rails.env == "development"
        realtime_server_pub_url = "http://lh:3001/publish"
      else
        realtime_server_pub_url = "http://tofuapp.cloudno.de/publish"
      end

      EM.run do
        
        http = EM::HttpRequest.new(realtime_server_pub_url).post :body => { "recipient_ids" => recipient_ids, "message" => @tofu.to_json}
        http.callback {
          EM.stop
        }
        http.errback {
          EM.stop
        }
      end
      
      # respond_with @tofu
    else
      # respond_with @tofu
    end

    respond_to do |format|
      format.json { render :json => @tofu }
    end
    
  end


  def destroy

    @tofu = current_user.tofus.find(params[:id]);
    @tofu.destroy

    # TODO send a proper response
  	respond_with (true)
  end
end
