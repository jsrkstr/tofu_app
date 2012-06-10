class Comment < ActiveRecord::Base
  attr_accessible :author_id, :content, :created_at, :group, :recipient_ids, :tofu_id, :updated_at
end
