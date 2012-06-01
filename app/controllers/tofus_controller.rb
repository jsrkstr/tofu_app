class TofusController < ApplicationController
  before_filter :signed_in_user

  respond_to :json

  def create
    # TODO send error on failure to save and send JSON instead of js
  	@tofu = current_user.tofus.build(params[:tofu])


  	if @tofu.save

      # send to all recipients

      @tofu["recipient_ids"] = @tofu.recipient_ids.to_s.split(","); #convert to array after it is saved as string
      json_tofu = @tofu.to_json

      # Constants
      if Rails.env == "development"
        realtime_server_pub_url = "http://lh:3001/publish"
      else
        realtime_server_pub_url = "http://tofuapp.cloudno.de/publish"
      end

      EM.run do
        @tofu.recipient_ids.each do |id|
          http = EM::HttpRequest.new(realtime_server_pub_url).post :body => {"data" => json_tofu}
          http.callback {
            EM.stop
          }
          http.errback {
            EM.stop
          }
        end
      end

      respond_with @tofu
  	else
  		respond_with @tofu
  	end

  end

  def destroy

    @tofu = current_user.tofus.find(params[:id]);
    @tofu.destroy

    # TODO send a proper response
  	respond_with (true)
  end
end
