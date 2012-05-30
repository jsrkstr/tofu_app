class TofusController < ApplicationController
  before_filter :signed_in_user

  respond_to :json

  require 'pubnub'

  def create
    # TODO send error on failure to save and send JSON instead of js
  	@tofu = current_user.tofus.build(params[:tofu])

  	if @tofu.save
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
