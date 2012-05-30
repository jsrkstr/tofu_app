class StaticPagesController < ApplicationController
  def home
  	if signed_in?
      @micropost  = current_user.microposts.build
      @feed_items = current_user.feed.paginate(page: params[:page])
      @tofus = current_user.tofus.paginate(page: params[:page])
      @received_tofus = current_user.received_tofus.paginate(page: params[:page])
      @friends = current_user.friends
      @commands = ["task,group", "reminder,group", "msg,group","question,group","high,priority", "low,priority", "moderate,priority"]
    end
  end

  def help
  end

  def about
  end

  def contact
  end
end
