class TofusController < ApplicationController
  before_filter :signed_in_user

  respond_to :json

  def create
    # TODO send error on failure to save and send JSON instead of js
  	@tofu = current_user.tofus.build(params[:tofu])


  	if @tofu.save

      # send to all recipients
      json_tofu = @tofu.to_json

      # @tofu.all_recipient_ids.each do |recipient_id|
      #   Pusher[recipient_id].trigger!('add:tofu', json_tofu)
      # end

      EM.run do
        @tofu.all_recipient_ids.each do |id|
          http = EM::HttpRequest.new('http://lh:3001/publish').post :body => {"data" => json_tofu}
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
