class Tofu < ActiveRecord::Base
  attr_accessible :content, :group, :priority, :status
  belongs_to :user

  has_many :reciepts, dependent: :destroy

  validates :user_id, presence: true
  validates :content, presence: true, length: { maximum: 140 }
  validates :group, presence: true
  # validates :recipients, presence: true

  before_save :create_reciepts

  default_scope order: 'tofus.created_at DESC'

  private

  	def create_reciepts
  		:recipients_ids.split(",").each do |id|
  			Reciepts.create!(recipient_id: id)
  		end
  	end
end
