class FriendshipsController < ApplicationController
  before_filter :signed_in_user

  respond_to :json

  def create
    @friendship = current_user.connect(params[:friendship][:user_id])
    respond_with @friendship
  end

  def update
    @friendship = current_user.approve(params[:friendship][:friendship_id])
    respond_with  @friendship
  end

  def destroy
    current_user.disconnect(params[:id])
    # TODO send proper response
    respond_with (true)
  end

end