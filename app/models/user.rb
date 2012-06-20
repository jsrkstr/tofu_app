# == Schema Information
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  email      :string(255)
#  created_at :datetime        not null
#  updated_at :datetime        not null
#

class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation

  has_many :microposts, dependent: :destroy
  has_many :tofus, dependent: :destroy
  has_many :reciepts, foreign_key: "recipient_id"
  has_many :received_tofus, through: :reciepts, source: "tofu" 

  # has_many :reciepts, foreign_key: "sender_id", dependent: :destroy
  
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  has_many :followed_users, through: :relationships, source: "followed"

  has_many :reverse_relationships, foreign_key: "followed_id",
                                   class_name:  "Relationship",
                                   dependent:   :destroy
  has_many :followers, through: :reverse_relationships, source: :follower


  has_many :approved_friendships, :class_name => "Friendship", :conditions => { :approved => true }, dependent: :destroy

  has_many :unapproved_friendships, :class_name => "Friendship", :conditions => { :approved => false }

  has_many :direct_friends, :through => :approved_friendships, :source => :friend

  has_many :inverse_approved_friendships, :class_name => "Friendship", :foreign_key => "friend_id", :conditions => { :approved => true }, dependent: :destroy

  has_many :inverse_unapproved_friendships, :class_name => "Friendship", :foreign_key => "friend_id", :conditions => { :approved => false }

  has_many :indirect_friends, :through => :inverse_approved_friendships, :source => :user

  has_many :requested_friends, :through => :unapproved_friendships, :source => :friend

  has_many :pending_friends, :through => :inverse_unapproved_friendships, :source => :user



  def friends
    direct_friends | indirect_friends
  end

  def friend?(other_user_id)
    approved_friendships.find_by_friend_id(other_user_id) || inverse_approved_friendships.find_by_user_id(other_user_id)
  end

  def approve(friendship_id)
    @friendship = inverse_unapproved_friendships.find(friendship_id);
    if @friendship
      @friendship.approved = true
      @friendship.save
    end
    @friendship
  end

  def pending_friendships
    inverse_unapproved_friendships
  end

  def requested_friendships
    unapproved_friendships
  end


  # connect to a user
  def connect(other_user_id)

    # see of other user has already requested
    @pending = pending_friendships
    @friendship = @pending.find_by_user_id(other_user_id)

    # Approve, when there is a request pending
    if @friendship
      @friendship.approved = true  
      @friendship.save
    end


    # see you user has already requested a friendship
    unless @friendship
      @requested = requested_friendships
      @friendship = @requested.find_by_friend_id(other_user_id)
    end

    # see if they are friends
    unless @friendship
      @friendship = friend?(other_user_id)
    end


    # finally create new 
    unless @friendship
      @friendship = unapproved_friendships.create!(friend_id: other_user_id, approved: false)
    end

    @friendship

  end
  # connect to a user


  def disconnect(friendship_id)
    @friendship = Friendship.find(friendship_id);
    if (@friendship.user_id == self.id) | (@friendship.friend_id == self.id)
      @friendship.destroy
    end
  end



  has_secure_password

  before_save { |user| user.email = email.downcase }
  before_save :create_remember_token
  before_save :create_gravatar_id


  # hotfix for existing users, save gravatar_id
  after_initialize do |user|
    unless user.gravatar_id
      user["gravatar_id"] = Digest::MD5::hexdigest(user.email.downcase)
      user.save
    end
  end


  validates :name, presence: true, length: { maximum: 50 }
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence:   true,
                    format:     { with: VALID_EMAIL_REGEX },
                    uniqueness: { case_sensitive: false }
  validates :password, presence: true, length: { minimum: 6 }
  validates :password_confirmation, presence: true

  def feed
    Micropost.from_users_followed_by(self)
  end

  def following?(other_user)
    relationships.find_by_followed_id(other_user.id)
  end

  def follow!(other_user)
    relationships.create!(followed_id: other_user.id)
  end

  def unfollow!(other_user)
    relationships.find_by_followed_id(other_user.id).destroy
  end

  private

    def create_remember_token
      self.remember_token = SecureRandom.urlsafe_base64
    end

    def create_gravatar_id
      self.gravatar_id = Digest::MD5::hexdigest(self.email.downcase)
    end
    
end
