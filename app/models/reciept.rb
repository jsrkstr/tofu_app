class Reciept < ActiveRecord::Base
  attr_accessible :recipient_id, :tofu_id

  belongs_to :tofu
end
