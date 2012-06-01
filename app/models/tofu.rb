class Tofu < ActiveRecord::Base
  attr_accessible :content, :group, :priority, :status, :recipient_ids
  belongs_to :user

  has_many :reciepts, dependent: :destroy

  validates :user_id, presence: true
  validates :content, presence: true, length: { maximum: 140 }
  validates :group, presence: true
  # validates :recipients, presence: true

  after_save :create_reciepts

  after_initialize do |tofu|
    tofu["user_name"] = tofu.user.name
    gravatar_id = Digest::MD5::hexdigest(tofu.user.email.downcase)
    gravatar_url = "https://secure.gravatar.com/avatar/#{gravatar_id}"
    tofu["user_gravatar"] = gravatar_url
    tofu["user_id"] = tofu.user.id
  end


  default_scope order: 'tofus.created_at DESC'

  private

  	def create_reciepts
      split = self.recipient_ids.to_s.split(",")
  		split.each do |i|
  			reciepts.create!(recipient_id: i)
  		end

      # self["all_recipient_ids"] = split # save all (array)
      # self.recipient_ids = split[0] # store only first recipient in tofu table/ model

  	end

end
