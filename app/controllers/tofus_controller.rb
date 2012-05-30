class TofusController < ApplicationController
  before_filter :signed_in_user

  respond_to :json

  def create

  	@tofu = current_user.tofus.build(params[:tofu])

  	if @tofu.save
  		respond_with @tofu
  	else
  		respond_with @tofu
  	end

  	# TODO send error on failure to save and send JSON instead of js

  end

  def destroy

  	# TODO fix destroy and

  	# @tofu.destroy

  	respond_with @tofu
    # respond_to do |format|
    #   # format.html { redirect_to current_user }
    #   format.js
    # end
  end
end
