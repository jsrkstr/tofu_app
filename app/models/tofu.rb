class Tofu < ActiveRecord::Base
  attr_accessible :content, :group, :priority, :status, :recipient_ids
  belongs_to :user

  has_many :reciepts, dependent: :destroy

  validates :user_id, presence: true
  validates :content, presence: true, length: { maximum: 140 }
  validates :group, presence: true
  # validates :recipients, presence: true

  after_save :create_reciepts

  default_scope order: 'tofus.created_at DESC'

  private

  	def create_reciepts
      split = self.recipient_ids.to_s.split(",")
  		split.each do |i|
  			reciepts.create!(recipient_id: i)
  		end

      self.recipient_ids = split[1] # store only first recipient in tofu table/ model

  	end

end
